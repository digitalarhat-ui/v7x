import os, json, math
import numpy as np
import trimesh
from scipy.spatial import ConvexHull
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

OUT=os.path.join(os.path.dirname(__file__),'assets')
os.makedirs(OUT,exist_ok=True)

scene=trimesh.Scene()
counts={}

# Neutral placeholders. Runtime assigns final Three.js materials by node prefix.
MATS={
    'base':PBRMaterial(name='BASE',baseColorFactor=[0.55,0.61,0.55,1],metallicFactor=0.0,roughnessFactor=0.58),
    'upper':PBRMaterial(name='UPPER',baseColorFactor=[0.88,0.82,0.72,1],metallicFactor=0.0,roughnessFactor=0.54),
    'tall':PBRMaterial(name='TALL',baseColorFactor=[0.55,0.61,0.55,1],metallicFactor=0.0,roughnessFactor=0.58),
    'carcass':PBRMaterial(name='CARCASS',baseColorFactor=[0.47,0.49,0.46,1],metallicFactor=0.0,roughnessFactor=0.65),
    'stone':PBRMaterial(name='STONE',baseColorFactor=[0.82,0.80,0.76,1],metallicFactor=0.0,roughnessFactor=0.48),
    'metal':PBRMaterial(name='METAL',baseColorFactor=[0.62,0.65,0.64,1],metallicFactor=0.95,roughnessFactor=0.28),
    'glass':PBRMaterial(name='GLASS',baseColorFactor=[0.9,0.97,0.95,0.25],metallicFactor=0.0,roughnessFactor=0.06,alphaMode='BLEND'),
    'appliance':PBRMaterial(name='APPLIANCE',baseColorFactor=[0.05,0.06,0.06,1],metallicFactor=0.2,roughnessFactor=0.18),
    'room':PBRMaterial(name='ROOM',baseColorFactor=[0.70,0.68,0.64,1],metallicFactor=0.0,roughnessFactor=0.82),
    'floor':PBRMaterial(name='FLOOR',baseColorFactor=[0.43,0.41,0.38,1],metallicFactor=0.0,roughnessFactor=0.92),
    'reveal':PBRMaterial(name='REVEAL',baseColorFactor=[0.12,0.13,0.12,1],metallicFactor=0.0,roughnessFactor=0.86),
    'light':PBRMaterial(name='LIGHT',baseColorFactor=[1.0,0.86,0.65,1],metallicFactor=0.0,roughnessFactor=0.65),
}

def chamfer_box(extents, bevel=0.004):
    ex=np.array(extents,dtype=float)
    h=ex/2.0
    r=float(max(0.0004,min(bevel, *(h*0.24))))
    pts=[]
    for sx in (-1,1):
      for sy in (-1,1):
       for sz in (-1,1):
        pts += [
          [sx*(h[0]-r), sy*h[1], sz*h[2]],
          [sx*h[0], sy*(h[1]-r), sz*h[2]],
          [sx*h[0], sy*h[1], sz*(h[2]-r)]
        ]
    pts=np.array(pts)
    hull=ConvexHull(pts)
    mesh=trimesh.Trimesh(vertices=pts,faces=hull.simplices,process=True)
    mesh.fix_normals()
    mesh=mesh.copy()
    mesh.unmerge_vertices()
    uv=np.zeros((len(mesh.vertices),2),dtype=np.float32)
    faces=mesh.faces
    fn=mesh.face_normals
    for fi,face in enumerate(faces):
        n=np.abs(fn[fi])
        axis=int(np.argmax(n))
        for vi in face:
            v=mesh.vertices[vi]
            if axis==2:
                u=(v[0]/max(ex[0],1e-6))+.5; vv=(v[1]/max(ex[1],1e-6))+.5
            elif axis==0:
                u=(v[2]/max(ex[2],1e-6))+.5; vv=(v[1]/max(ex[1],1e-6))+.5
            else:
                u=(v[0]/max(ex[0],1e-6))+.5; vv=(v[2]/max(ex[2],1e-6))+.5
            uv[vi]=[u,vv]
    mesh.visual=TextureVisuals(uv=uv,material=MATS['carcass'])
    return mesh

def add_mesh(mesh,name,mat_key='carcass',pos=(0,0,0),rot=None,scale=None):
    mesh=mesh.copy()
    if hasattr(mesh.visual,'material'):
        mesh.visual.material=MATS[mat_key]
    else:
        mesh.visual=TextureVisuals(uv=np.zeros((len(mesh.vertices),2)),material=MATS[mat_key])
    T=np.eye(4)
    if rot is not None:
        T=trimesh.transformations.euler_matrix(*rot)
    T[:3,3]=np.array(pos,dtype=float)
    if scale is not None:
        T=T @ np.diag([scale[0],scale[1],scale[2],1.0])
    scene.add_geometry(mesh,node_name=name,geom_name=name,transform=T)
    counts[name.split('_')[0]]=counts.get(name.split('_')[0],0)+1

def add_box(name,extents,pos,mat='carcass',bevel=0.003):
    add_mesh(chamfer_box(extents,bevel),name,mat,pos)

def add_cylinder(name,radius,length,pos,mat='metal',axis='y',sections=24):
    mesh=trimesh.creation.cylinder(radius=radius,height=length,sections=sections)
    rot=(0,0,0)
    if axis=='y': rot=(math.pi/2,0,0)
    elif axis=='x': rot=(0,math.pi/2,0)
    add_mesh(mesh,name,mat,pos,rot)

def add_handle(prefix,x,y,z,length,vertical=True):
    if vertical:
        add_cylinder(prefix+'_BAR',.011,length,(x,y,z),'metal','y',20)
        gap=length*.34
        add_cylinder(prefix+'_POST1',.008,.042,(x,y-gap,z-.020),'metal','z',16)
        add_cylinder(prefix+'_POST2',.008,.042,(x,y+gap,z-.020),'metal','z',16)
    else:
        add_cylinder(prefix+'_BAR',.011,length,(x,y,z),'metal','x',20)
        gap=length*.34
        add_cylinder(prefix+'_POST1',.008,.042,(x-gap,y,z-.020),'metal','z',16)
        add_cylinder(prefix+'_POST2',.008,.042,(x+gap,y,z-.020),'metal','z',16)

def tube_mesh(points,radius=.019,radial=12):
    pts=np.asarray(points,float)
    rings=[]
    for i,p in enumerate(pts):
        if i==0: t=pts[1]-pts[0]
        elif i==len(pts)-1: t=pts[-1]-pts[-2]
        else: t=pts[i+1]-pts[i-1]
        t=t/(np.linalg.norm(t)+1e-9)
        ref=np.array([0.,1.,0.]) if abs(np.dot(t,[0,1,0]))<.92 else np.array([1.,0.,0.])
        n=np.cross(t,ref); n=n/(np.linalg.norm(n)+1e-9)
        b=np.cross(t,n); b=b/(np.linalg.norm(b)+1e-9)
        ring=[]
        for j in range(radial):
            a=2*math.pi*j/radial
            ring.append(p+radius*(math.cos(a)*n+math.sin(a)*b))
        rings.append(ring)
    verts=np.array(rings).reshape(-1,3)
    faces=[]
    for i in range(len(pts)-1):
        for j in range(radial):
            a=i*radial+j; bb=i*radial+(j+1)%radial
            cc=(i+1)*radial+(j+1)%radial; d=(i+1)*radial+j
            faces += [[a,bb,cc],[a,cc,d]]
    mesh=trimesh.Trimesh(vertices=verts,faces=np.array(faces),process=True)
    mesh.visual=TextureVisuals(uv=np.zeros((len(mesh.vertices),2)),material=MATS['metal'])
    return mesh

add_box('ROOM_FLOOR',(8.8,.06,7.8),(0,-.03,.25),'floor',.002)
add_box('ROOM_BACK_WALL',(8.7,3.65,.12),(0,1.825,-2.26),'room',.002)
add_box('ROOM_SIDE_WALL',(.10,3.65,5.4),(-4.28,1.825,.35),'room',.002)
add_box('ROOM_CEILING_SOFT',(8.7,.10,1.02),(0,3.48,-1.78),'room',.002)

xs=[-1.62,-.82,-.02,.78,1.58]
W=.785
base_y=.595; base_h=.85; front_z=-1.327
base_depth=.67; base_back_z=-2.015
upper_y=2.18; upper_h=.86; upper_depth=.47; upper_front_z=-1.505; upper_back_z=-1.995

add_box('REVEAL_TOE_KICK',(4.00,.17,.39),(-.05,.085,-1.84),'reveal',.003)

for i,x in enumerate(xs):
    p=f'BASE{i+1}'
    add_box(f'BASE_CARCASS_{p}_L',(.018,base_h,.64),(x-W/2+.009,base_y,-1.68),'carcass',.002)
    add_box(f'BASE_CARCASS_{p}_R',(.018,base_h,.64),(x+W/2-.009,base_y,-1.68),'carcass',.002)
    add_box(f'BASE_CARCASS_{p}_BOTTOM',(W-.036,.018,.62),(x,.18,-1.68),'carcass',.002)
    add_box(f'BASE_CARCASS_{p}_BACK',(W-.036,base_h-.04,.012),(x,base_y,base_back_z+.012),'carcass',.0015)
    if i in (1,3):
        for j,y in enumerate((.315,.585,.855),1):
            add_box(f'BASE_DRAWER_{p}_{j}',(W-.055,.245,.020),(x,y,front_z),'base',.0025)
            add_box(f'REVEAL_BASE_DRAWER_{p}_{j}',(W-.040,.010,.012),(x,y-.132,front_z-.012),'reveal',.001)
            add_handle(f'METAL_HANDLE_{p}_{j}',x,y+.035,front_z+.026,.25,False)
    else:
        add_box(f'BASE_FRONT_{p}',(W-.042,.806,.020),(x,base_y,front_z),'base',.0025)
        add_box(f'REVEAL_BASE_FRONT_{p}',(W-.030,.818,.010),(x,base_y,front_z-.013),'reveal',.001)
        add_handle(f'METAL_HANDLE_{p}',x+W/2-.088,base_y,front_z+.026,.34,True)

add_box('BASE_END_PANEL_LEFT',(.028,1.00,.69),(-2.025,.58,-1.68),'base',.002)
add_box('BASE_END_PANEL_RIGHT',(.028,1.00,.69),(1.985,.58,-1.68),'base',.002)

counter_y=1.038; counter_z=-1.69; counter_d=.82; counter_t=.036
left_edge=-2.16; right_edge=2.06
sink_x=-1.30; sink_w=.70; sink_z=-1.59; sink_d=.40
sx0=sink_x-sink_w/2; sx1=sink_x+sink_w/2
front_edge=counter_z+counter_d/2; back_edge=counter_z-counter_d/2
sz0=sink_z-sink_d/2; sz1=sink_z+sink_d/2
add_box('COUNTERTOP_LEFT',(sx0-left_edge,counter_t,counter_d),((left_edge+sx0)/2,counter_y,counter_z),'stone',.004)
add_box('COUNTERTOP_RIGHT',(right_edge-sx1,counter_t,counter_d),((sx1+right_edge)/2,counter_y,counter_z),'stone',.004)
add_box('COUNTERTOP_SINK_FRONT',(sink_w,counter_t,front_edge-sz1),(sink_x,counter_y,(sz1+front_edge)/2),'stone',.003)
add_box('COUNTERTOP_SINK_BACK',(sink_w,counter_t,sz0-back_edge),(sink_x,counter_y,(back_edge+sz0)/2),'stone',.003)
add_box('REVEAL_COUNTER_CONTACT',(4.12,.012,.76),(-.05,1.014,-1.69),'reveal',.001)
add_box('BACKSPLASH',(4.12,1.02,.035),(-.05,1.57,-2.105),'room',.003)

for i,x in enumerate(xs):
    p=f'UPPER{i+1}'
    add_box(f'UPPER_CARCASS_{p}_L',(.016,upper_h,.45),(x-W/2+.008,upper_y,-1.76),'carcass',.0018)
    add_box(f'UPPER_CARCASS_{p}_R',(.016,upper_h,.45),(x+W/2-.008,upper_y,-1.76),'carcass',.0018)
    add_box(f'UPPER_CARCASS_{p}_TOP',(W-.032,.016,.45),(x,2.602,-1.76),'carcass',.0018)
    add_box(f'UPPER_CARCASS_{p}_BOTTOM',(W-.032,.016,.45),(x,1.758,-1.76),'carcass',.0018)
    add_box(f'UPPER_CARCASS_{p}_BACK',(W-.032,upper_h-.04,.010),(x,upper_y,upper_back_z+.010),'carcass',.001)
    if i in (0,4):
        fw=.034; fh=.036
        add_box(f'UPPER_FRONT_{p}_TOP',(W-.026,fh,.030),(x,upper_y+.382,upper_front_z),'upper',.002)
        add_box(f'UPPER_FRONT_{p}_BOTTOM',(W-.026,fh,.030),(x,upper_y-.382,upper_front_z),'upper',.002)
        add_box(f'UPPER_FRONT_{p}_LEFT',(fw,.765,.030),(x-W/2+.035,upper_y,upper_front_z),'upper',.002)
        add_box(f'UPPER_FRONT_{p}_RIGHT',(fw,.765,.030),(x+W/2-.035,upper_y,upper_front_z),'upper',.002)
        add_box(f'GLASS_{p}',(W-.085,.725,.008),(x,upper_y,-1.490),'glass',.001)
        add_box(f'CARCASS_DISPLAY_BACK_{p}',(W-.10,.735,.012),(x,upper_y,-1.935),'carcass',.001)
        add_box(f'UPPER_SHELF_{p}_1',(W-.10,.012,.34),(x,2.03,-1.73),'upper',.001)
        add_box(f'UPPER_SHELF_{p}_2',(W-.10,.012,.34),(x,2.33,-1.73),'upper',.001)
        add_handle(f'METAL_HANDLE_{p}',x+W/2-.085,upper_y,-1.468,.16,True)
    else:
        add_box(f'UPPER_FRONT_{p}',(W-.042,.815,.020),(x,upper_y,upper_front_z),'upper',.0025)
        add_box(f'REVEAL_UPPER_FRONT_{p}',(W-.030,.827,.010),(x,upper_y,upper_front_z-.013),'reveal',.001)
        add_handle(f'METAL_HANDLE_{p}',x+W/2-.088,upper_y,upper_front_z+.026,.34,True)

add_box('UPPER_CROWN_RAIL',(4.10,.038,.49),(-.05,2.642,-1.76),'upper',.002)
add_box('UPPER_BOTTOM_RAIL',(4.10,.024,.49),(-.05,1.742,-1.76),'upper',.0015)
add_box('UPPER_END_PANEL_LEFT',(.028,.86,.49),(-2.025,2.18,-1.76),'upper',.002)
add_box('UPPER_END_PANEL_RIGHT',(.028,.86,.49),(1.985,2.18,-1.76),'upper',.002)

tx=2.46; tw=.88; th=2.84; ty=1.42; tz=-1.68
add_box('TALL_CARCASS_L',(.020,th,.69),(tx-tw/2+.010,ty,tz),'carcass',.002)
add_box('TALL_CARCASS_R',(.020,th,.69),(tx+tw/2-.010,ty,tz),'carcass',.002)
add_box('TALL_CARCASS_TOP',(tw-.04,.020,.69),(tx,2.83,tz),'carcass',.002)
add_box('TALL_CARCASS_BOTTOM',(tw-.04,.020,.69),(tx,.02,tz),'carcass',.002)
add_box('TALL_CARCASS_BACK',(tw-.04,th-.06,.012),(tx,ty,-2.025),'carcass',.001)
add_box('TALL_FRONT_TOP',(.840,1.16,.020),(tx,2.18,-1.305),'tall',.0025)
add_box('REVEAL_TALL_TOP',(.852,1.172,.010),(tx,2.18,-1.319),'reveal',.001)
add_handle('METAL_HANDLE_TALL_TOP',tx+.34,2.18,-1.278,.40,True)
add_box('TALL_FRONT_BOTTOM',(.840,.38,.020),(tx,.205,-1.305),'tall',.0025)
add_box('REVEAL_TALL_BOTTOM',(.852,.392,.010),(tx,.205,-1.319),'reveal',.001)
add_handle('METAL_HANDLE_TALL_BOTTOM',tx,.205,-1.278,.32,False)
add_box('REVEAL_OVEN_CAVITY',(.73,.96,.030),(tx,.91,-1.325),'reveal',.002)
add_box('APPLIANCE_OVEN_GLASS',(.64,.70,.024),(tx,.88,-1.285),'appliance',.003)
add_box('METAL_OVEN_TOP',(.64,.038,.030),(tx,1.245,-1.278),'metal',.002)
add_box('METAL_OVEN_BOTTOM',(.64,.030,.030),(tx,.515,-1.278),'metal',.002)
add_box('METAL_OVEN_LEFT',(.030,.76,.030),(tx-.305,.88,-1.278),'metal',.002)
add_box('METAL_OVEN_RIGHT',(.030,.76,.030),(tx+.305,.88,-1.278),'metal',.002)
add_cylinder('METAL_OVEN_KNOB_L',.034,.022,(tx-.15,1.18,-1.245),'metal','z',24)
add_cylinder('METAL_OVEN_KNOB_R',.034,.022,(tx+.15,1.18,-1.245),'metal','z',24)

add_box('METAL_SINK_BOTTOM',(.58,.018,.34),(-1.30,.975,-1.59),'metal',.004)
add_box('METAL_SINK_FRONT',(.60,.16,.018),(-1.30,1.00,-1.405),'metal',.003)
add_box('METAL_SINK_BACK',(.60,.16,.018),(-1.30,1.00,-1.775),'metal',.003)
add_box('METAL_SINK_LEFT',(.018,.16,.36),(-1.61,1.00,-1.59),'metal',.003)
add_box('METAL_SINK_RIGHT',(.018,.16,.36),(-.99,1.00,-1.59),'metal',.003)
add_box('METAL_SINK_RIM_FRONT',(.70,.018,.020),(-1.30,1.050,-1.405),'metal',.002)
add_box('METAL_SINK_RIM_BACK',(.70,.018,.020),(-1.30,1.050,-1.775),'metal',.002)
add_box('METAL_SINK_RIM_LEFT',(.020,.018,.37),(-1.637,1.050,-1.59),'metal',.002)
add_box('METAL_SINK_RIM_RIGHT',(.020,.018,.37),(-.963,1.050,-1.59),'metal',.002)

add_cylinder('METAL_FAUCET_STEM',.026,.42,(-1.30,1.30,-1.91),'metal','y',28)
curve=[]
for i in range(30):
    t=i/29
    p0=np.array([-1.30,1.50,-1.91]);p1=np.array([-1.30,1.78,-1.91]);p2=np.array([-1.30,1.78,-1.65]);p3=np.array([-1.30,1.55,-1.64])
    p=(1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t*t*p2+t**3*p3
    curve.append(p)
add_mesh(tube_mesh(curve,.020,14),'METAL_FAUCET_SPOUT','metal')
add_cylinder('METAL_FAUCET_LEVER',.010,.12,(-1.235,1.37,-1.90),'metal','x',18)

add_box('APPLIANCE_COOKTOP',(.64,.014,.48),(.82,1.068,-1.61),'appliance',.003)
for j,(dx,dz) in enumerate([(-.17,-.12),(.17,-.12),(-.17,.12),(.17,.12)],1):
    add_cylinder(f'APPLIANCE_BURNER_{j}',.070,.006,(.82+dx,1.079,-1.61+dz),'metal','y',28)
    add_cylinder(f'APPLIANCE_BURNER_INNER_{j}',.048,.008,(.82+dx,1.083,-1.61+dz),'appliance','y',28)

add_box('LIGHT_STRIP',(3.88,.008,.022),(-.05,1.72,-1.495),'light',.001)

for geom in scene.geometry.values():
    try: geom.fix_normals()
    except: pass

glb=scene.export(file_type='glb')
out_path=os.path.join(OUT,'higher-class-fixed-kitchen-v3.glb')
open(out_path,'wb').write(glb)
manifest={
    'asset':'higher-class-fixed-kitchen-v3.glb',
    'bytes':len(glb),
    'nodes':len(scene.graph.nodes_geometry),
    'geometry':len(scene.geometry),
    'zones':counts,
    'bounds':scene.bounds.tolist(),
    'extents':scene.extents.tolist(),
}
open(os.path.join(OUT,'higher-class-fixed-kitchen-v3-manifest.json'),'w',encoding='utf-8').write(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
