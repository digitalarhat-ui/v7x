import cadquery as cq
import trimesh
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter, sobel

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets'
ASSETS.mkdir(parents=True,exist_ok=True)

# ---------- texture derivation from client-supplied references ----------
import base64, io
B64=ROOT/'source-assets'/'b64'
def read_b64_parts(prefix):
    parts=sorted(B64.glob(prefix+'-*.txt'))
    if parts:
        txt=''.join(x.read_text().strip() for x in parts)
        return base64.b64decode(txt)
    # Packaged release fallback: originals are intentionally retained in /assets.
    fallback=ASSETS/('client-light-wood-original.jpg' if prefix=='wood' else 'client-sage-original.jpg')
    if fallback.exists():
        return fallback.read_bytes()
    raise FileNotFoundError(f'Missing client source for {prefix}: neither source-assets/b64 nor {fallback}')
wood_bytes=read_b64_parts('wood')
sage_bytes=read_b64_parts('sage')
wood_src=Image.open(io.BytesIO(wood_bytes)).convert('RGB')
sage_src=Image.open(io.BytesIO(sage_bytes)).convert('RGB')

# Keep originals unchanged in V3 package for client-reference visibility.
(ASSETS/'client-light-wood-original.jpg').write_bytes(wood_bytes)
(ASSETS/'client-sage-original.jpg').write_bytes(sage_bytes)


def flatten_albedo(img:Image.Image, strength=0.82, target_long=1536):
    w,h=img.size
    scale=target_long/max(w,h)
    img=img.resize((max(1,int(w*scale)),max(1,int(h*scale))),Image.Resampling.LANCZOS)
    a=np.asarray(img).astype(np.float32)/255.0
    # Remove large photographic illumination gradients while preserving local material character.
    blur=gaussian_filter(a,sigma=(45,45,0),mode='reflect')
    mean=blur.mean(axis=(0,1),keepdims=True)
    flat=np.clip(a/(blur+1e-4)*mean,0,1)
    out=np.clip(a*(1-strength)+flat*strength,0,1)
    return Image.fromarray((out*255).astype(np.uint8),'RGB')

wood_albedo=flatten_albedo(wood_src,0.72,1536)
sage_flat=flatten_albedo(sage_src,0.90,1536)
# Sage reference can look fabric-like if copied literally. Preserve tone, restrain color variation.
sa=np.asarray(sage_flat).astype(np.float32)/255.0
smean=sa.mean(axis=(0,1),keepdims=True)
sa=np.clip(smean + (sa-smean)*0.28,0,1)
sage_albedo=Image.fromarray((sa*255).astype(np.uint8),'RGB')
wood_albedo.save(ASSETS/'hc-wood-albedo.jpg',quality=92,subsampling=0)
sage_albedo.save(ASSETS/'hc-sage-albedo.jpg',quality=92,subsampling=0)


def support_maps(img:Image.Image, rough_base:float, rough_amp:float, normal_strength:float, prefix:str):
    arr=np.asarray(img.convert('L')).astype(np.float32)/255.0
    low=gaussian_filter(arr,2.2,mode='reflect')
    hi=arr-low
    # Roughness: subtle non-color variation only.
    rough=np.clip(rough_base + hi*rough_amp,0.15,0.95)
    Image.fromarray((rough*255).astype(np.uint8),'L').save(ASSETS/f'{prefix}-roughness.png')
    # Tangent-space normal from restrained height gradients.
    height=gaussian_filter(arr,0.8,mode='reflect')
    gx=sobel(height,axis=1,mode='reflect')
    gy=sobel(height,axis=0,mode='reflect')
    nx=-gx*normal_strength; ny=-gy*normal_strength; nz=np.ones_like(nx)
    l=np.sqrt(nx*nx+ny*ny+nz*nz)+1e-8
    normal=np.stack([(nx/l*.5+.5),(ny/l*.5+.5),(nz/l*.5+.5)],axis=2)
    Image.fromarray((normal*255).astype(np.uint8),'RGB').save(ASSETS/f'{prefix}-normal.png')

support_maps(wood_albedo,0.58,0.85,0.42,'hc-wood')
support_maps(sage_albedo,0.64,0.38,0.16,'hc-sage')

# Quiet illustrative neutral stone PBR maps using irregular multi-scale noise + warped veins.
rng=np.random.default_rng(43)
N=1024
noise=rng.normal(0,1,(N,N))
coarse=gaussian_filter(noise,45); medium=gaussian_filter(noise,12); fine=gaussian_filter(noise,2.0)
y,x=np.mgrid[0:N,0:N]
warp=18*gaussian_filter(rng.normal(0,1,(N,N)),55)
phase=(x*0.0072 + y*0.0021 + warp)
vein=np.exp(-((np.sin(phase)+0.88)/0.095)**2)
vein2=np.exp(-((np.sin(phase*0.61+1.7)+0.94)/0.065)**2)
base=np.array([0.77,0.755,0.725],dtype=np.float32)
stone=np.ones((N,N,3),dtype=np.float32)*base
stone += coarse[...,None]*0.015 + medium[...,None]*0.012
stone -= (vein[...,None]*0.075 + vein2[...,None]*0.035)
stone=np.clip(stone,0,1)
Image.fromarray((stone*255).astype(np.uint8),'RGB').save(ASSETS/'hc-stone-albedo.jpg',quality=90,subsampling=0)
stone_gray=stone.mean(axis=2)
rough=np.clip(0.57 + medium*0.025 + fine*0.008,0.45,0.70)
Image.fromarray((rough*255).astype(np.uint8),'L').save(ASSETS/'hc-stone-roughness.png')
gx=sobel(gaussian_filter(stone_gray,1.2),axis=1); gy=sobel(gaussian_filter(stone_gray,1.2),axis=0)
nx=-gx*0.22; ny=-gy*0.22; nz=np.ones_like(nx); L=np.sqrt(nx*nx+ny*ny+nz*nz)+1e-8
normal=np.stack([nx/L*.5+.5,ny/L*.5+.5,nz/L*.5+.5],axis=2)
Image.fromarray((normal*255).astype(np.uint8),'RGB').save(ASSETS/'hc-stone-normal.png')

# ---------- authored geometry helpers ----------
scene=trimesh.Scene()
part_count=0

zone_colors={
    'HC_BASE_FRONTS':(0.55,0.61,0.54,1),
    'HC_UPPER_FRONTS':(0.89,0.84,0.77,1),
    'HC_TALL_FRONTS':(0.55,0.61,0.54,1),
    'HC_COUNTERTOP':(0.78,0.76,0.72,1),
    'HC_GLASS':(0.70,0.78,0.77,0.4),
    'HC_HANDLES':(0.55,0.58,0.58,1),
    'HC_METAL':(0.55,0.59,0.58,1),
    'HC_APPLIANCE':(0.08,0.085,0.085,1),
    'HC_CARCASS':(0.24,0.25,0.24,1),
    'HC_BACKSPLASH':(0.72,0.70,0.66,1),
    'HC_ROOM':(0.65,0.63,0.60,1),
    'HC_KICK':(0.06,0.065,0.06,1),
    'HC_LIGHT':(0.95,0.80,0.55,1),
    'HC_DARK':(0.025,0.028,0.027,1),
}

def material_for(zone):
    col=zone_colors.get(zone,(0.5,0.5,0.5,1))
    return trimesh.visual.material.PBRMaterial(
        name=zone,
        baseColorFactor=np.array(col),
        metallicFactor=0.0 if zone not in ('HC_HANDLES','HC_METAL') else 0.92,
        roughnessFactor=0.55 if zone not in ('HC_HANDLES','HC_METAL') else 0.28,
        alphaMode='BLEND' if zone=='HC_GLASS' else 'OPAQUE'
    )

def solid_to_mesh(solid, name, zone, uv_mode='front', uv_scale=(1.7,2.7), uv_offset=(0,0), tol=0.0060, ang=0.30):
    global part_count
    verts, tris=solid.tessellate(tol,ang)
    v=np.array([[p.x,p.y,p.z] for p in verts],dtype=np.float64)
    f=np.array(tris,dtype=np.int64)
    m=trimesh.Trimesh(vertices=v,faces=f,process=False,validate=False)
    # Keep face geometry crisp; authored bevel itself produces the highlight.
    m.remove_unreferenced_vertices()
    vv=m.vertices
    if uv_mode=='front':
        u=(vv[:,0]/uv_scale[0])+uv_offset[0]; vt=(vv[:,1]/uv_scale[1])+uv_offset[1]
    elif uv_mode=='horizontal_front':
        u=(vv[:,1]/uv_scale[1])+uv_offset[0]; vt=(vv[:,0]/uv_scale[0])+uv_offset[1]
    elif uv_mode=='top':
        u=(vv[:,0]/uv_scale[0])+uv_offset[0]; vt=(vv[:,2]/uv_scale[1])+uv_offset[1]
    elif uv_mode=='side':
        u=(vv[:,2]/uv_scale[0])+uv_offset[0]; vt=(vv[:,1]/uv_scale[1])+uv_offset[1]
    else:
        u=vv[:,0]/uv_scale[0]; vt=vv[:,2]/uv_scale[1]
    uv=np.column_stack([u,vt]).astype(np.float64)
    m.visual=trimesh.visual.texture.TextureVisuals(uv=uv,material=material_for(zone))
    scene.add_geometry(m,node_name=name,geom_name=name)
    part_count+=1
    return m

def rounded_box(w,h,d,x,y,z,r,name,zone,uv_mode='front',uv_scale=(1.7,2.7),uv_offset=(0,0)):
    wp=cq.Workplane('XY').box(w,h,d,centered=(True,True,True))
    rr=min(r,w/6,h/6,d/6)
    if rr>0.0003:
        try: wp=wp.edges().fillet(rr)
        except Exception:
            try: wp=wp.edges().chamfer(rr*0.75)
            except Exception: pass
    solid=wp.translate((x,y,z)).val()
    return solid_to_mesh(solid,name,zone,uv_mode,uv_scale,uv_offset)

def panel(w,h,d,x,y,z,name,zone,r=0.0017,uv_mode='front',uv_scale=(1.7,2.7),uv_offset=(0,0)):
    return rounded_box(w,h,d,x,y,z,r,name,zone,uv_mode,uv_scale,uv_offset)

def cylinder(radius,length,x,y,z,axis,name,zone,segments=24):
    direction={'x':cq.Vector(1,0,0),'y':cq.Vector(0,1,0),'z':cq.Vector(0,0,1)}[axis]
    start=cq.Vector(x,y,z)-direction*(length/2)
    solid=cq.Solid.makeCylinder(radius,length,start,direction)
    return solid_to_mesh(solid,name,zone,'front',(1,1),(0,0),0.0045,0.28)

def tube_path(points,radius,name,zone,radial=14):
    pts=np.asarray(points,float)
    rings=[]
    prev_n=np.array([1.,0.,0.])
    for i,p in enumerate(pts):
        if i==0:t=pts[1]-pts[0]
        elif i==len(pts)-1:t=pts[-1]-pts[-2]
        else:t=pts[i+1]-pts[i-1]
        t=t/(np.linalg.norm(t)+1e-9)
        # stable perpendicular basis
        cand=np.cross(t,np.array([0.,1.,0.]))
        if np.linalg.norm(cand)<0.15:cand=np.cross(t,np.array([1.,0.,0.]))
        n=cand/(np.linalg.norm(cand)+1e-9)
        if np.dot(n,prev_n)<0:n=-n
        b=np.cross(t,n); b=b/(np.linalg.norm(b)+1e-9)
        prev_n=n
        theta=np.linspace(0,2*np.pi,radial,endpoint=False)
        ring=p + radius*(np.cos(theta)[:,None]*n + np.sin(theta)[:,None]*b)
        rings.append(ring)
    verts=np.vstack(rings)
    faces=[]
    for i in range(len(rings)-1):
        for j in range(radial):
            a=i*radial+j; b=i*radial+(j+1)%radial; c=(i+1)*radial+(j+1)%radial; d=(i+1)*radial+j
            faces.extend([[a,b,c],[a,c,d]])
    # cap ends
    for end_i,offset,flip in [(0,0,True),(len(rings)-1,(len(rings)-1)*radial,False)]:
        center=len(verts); verts=np.vstack([verts,pts[end_i]])
        for j in range(radial):
            tri=[center,offset+(j+1)%radial,offset+j] if flip else [center,offset+j,offset+(j+1)%radial]
            faces.append(tri)
    m=trimesh.Trimesh(verts,np.array(faces),process=False)
    uv=np.column_stack([np.linspace(0,1,len(m.vertices)),np.zeros(len(m.vertices))])
    m.visual=trimesh.visual.texture.TextureVisuals(uv=uv,material=material_for(zone))
    scene.add_geometry(m,node_name=name,geom_name=name)
    global part_count; part_count+=1

# ---------- room context ----------
rounded_box(10.0,0.05,7.5,0,-0.03,0,0.003,'HC_ROOM__FLOOR','HC_ROOM','top',(3.0,3.0))
rounded_box(8.7,3.65,0.12,0,1.825,-2.24,0.002,'HC_ROOM__BACK_WALL','HC_ROOM','front',(4,3))
rounded_box(0.12,3.65,5.4,-4.29,1.825,0.35,0.002,'HC_ROOM__SIDE_WALL','HC_ROOM','side',(3,3))
rounded_box(8.7,0.10,5.4,0,3.58,0.35,0.002,'HC_ROOM__CEILING','HC_ROOM','top',(4,3))
rounded_box(8.45,0.075,0.035,0,0.037,-2.155,0.001,'HC_ROOM__SKIRTING_BACK','HC_ROOM')
rounded_box(0.035,0.075,5.1,-4.20,0.037,0.32,0.001,'HC_ROOM__SKIRTING_SIDE','HC_ROOM','side')

# ---------- base cabinets ----------
centers=[-1.62,-.82,-.02,.78,1.58]
W=.785
cab_y0=.18; cab_h=.82; side_t=.018; base_depth=.62; front_z=-1.325; back_z=-1.66
for i,x in enumerate(centers,1):
    # carcass panels, physically separated
    panel(side_t,cab_h,base_depth,x-W/2+side_t/2,.59,back_z,f'HC_CARCASS__B{i}_LEFT','HC_CARCASS',0.0012,'side')
    panel(side_t,cab_h,base_depth,x+W/2-side_t/2,.59,back_z,f'HC_CARCASS__B{i}_RIGHT','HC_CARCASS',0.0012,'side')
    panel(W-2*side_t,side_t,base_depth,x,cab_y0+side_t/2,back_z,f'HC_CARCASS__B{i}_BOTTOM','HC_CARCASS',0.0012,'top')
    panel(W-2*side_t,.06,.09,x,.965,-1.94,f'HC_CARCASS__B{i}_TOP_RAIL','HC_CARCASS',0.0012,'top')
    panel(W-2*side_t,cab_h-.04,.012,x,.59,-1.968,f'HC_CARCASS__B{i}_BACK','HC_CARCASS',0.0008,'front')
    if i in (2,4):
        # drawer stack with true 3mm reveals; horizontal wood UV direction
        ys=[.335,.59,.845]
        for j,y in enumerate(ys,1):
            panel(W-.012,.246,.020,x,y,front_z,f'HC_BASE_FRONTS__B{i}_DRAWER_{j}','HC_BASE_FRONTS',0.0022,'horizontal_front',(1.5,2.4),(i*.07,j*.11))
            cylinder(.010,.28,x,y+.01,front_z+.035,'x',f'HC_HANDLES__B{i}_DRAWER_{j}_BAR','HC_HANDLES',20)
            cylinder(.008,.045,x-.095,y+.01,front_z+.012,'z',f'HC_HANDLES__B{i}_DRAWER_{j}_MOUNT_L','HC_HANDLES',16)
            cylinder(.008,.045,x+.095,y+.01,front_z+.012,'z',f'HC_HANDLES__B{i}_DRAWER_{j}_MOUNT_R','HC_HANDLES',16)
    else:
        panel(W-.012,.758,.020,x,.59,front_z,f'HC_BASE_FRONTS__B{i}_DOOR','HC_BASE_FRONTS',0.0022,'front',(1.75,2.8),(i*.09,0))
        hx=x+W/2-.075
        cylinder(.010,.36,hx,.59,front_z+.035,'y',f'HC_HANDLES__B{i}_DOOR_BAR','HC_HANDLES',20)
        cylinder(.008,.045,hx,.47,front_z+.012,'z',f'HC_HANDLES__B{i}_DOOR_MOUNT_1','HC_HANDLES',16)
        cylinder(.008,.045,hx,.71,front_z+.012,'z',f'HC_HANDLES__B{i}_DOOR_MOUNT_2','HC_HANDLES',16)

# toe kick recessed
panel(4.00,.135,.28,-.02,.085,-1.835,'HC_KICK__BASE_PLINTH','HC_KICK',0.002,'front')

# countertop + backsplash
panel(4.23,.040,.82,-.02,1.025,-1.69,'HC_COUNTERTOP__MAIN_SLAB','HC_COUNTERTOP',0.004,'top',(3.0,1.5))
panel(4.06,.014,.030,-.02,.998,-1.326,'HC_DARK__COUNTER_UNDERCUT','HC_DARK',0.001,'front')
panel(4.12,1.00,.034,-.02,1.54,-2.105,'HC_BACKSPLASH__MAIN','HC_BACKSPLASH',0.002,'front',(3.2,2.2))
# subtle silicone shadow joint as actual geometry
panel(4.08,.010,.030,-.02,1.052,-2.075,'HC_CARCASS__COUNTER_BACK_JOINT','HC_CARCASS',0.0008,'front')

# ---------- upper cabinets ----------
upper_y=2.18; upper_h=.86; upper_depth=.41; upper_z=-1.76; upper_front_z=-1.545
for i,x in enumerate(centers,1):
    # carcass panels
    panel(side_t,upper_h,upper_depth,x-W/2+side_t/2,upper_y,upper_z,f'HC_CARCASS__U{i}_LEFT','HC_CARCASS',0.0011,'side')
    panel(side_t,upper_h,upper_depth,x+W/2-side_t/2,upper_y,upper_z,f'HC_CARCASS__U{i}_RIGHT','HC_CARCASS',0.0011,'side')
    panel(W-2*side_t,side_t,upper_depth,x,upper_y-upper_h/2+side_t/2,upper_z,f'HC_CARCASS__U{i}_BOTTOM','HC_CARCASS',0.0011,'top')
    panel(W-2*side_t,side_t,upper_depth,x,upper_y+upper_h/2-side_t/2,upper_z,f'HC_CARCASS__U{i}_TOP','HC_CARCASS',0.0011,'top')
    panel(W-2*side_t,upper_h-.04,.012,x,upper_y,-1.963,f'HC_CARCASS__U{i}_BACK','HC_CARCASS',0.0008,'front')
    if i in (1,5):
        # slim framed glass door, actual inset pane and interior shelves
        stile=.034; rail=.034; fw=W-.014; fh=.814
        panel(fw,rail,.025,x,upper_y+fh/2-rail/2,upper_front_z,f'HC_UPPER_FRONTS__U{i}_GLASS_TOP','HC_UPPER_FRONTS',0.0015,'front',(1.7,2.7),(i*.1,0))
        panel(fw,rail,.025,x,upper_y-fh/2+rail/2,upper_front_z,f'HC_UPPER_FRONTS__U{i}_GLASS_BOTTOM','HC_UPPER_FRONTS',0.0015,'front',(1.7,2.7),(i*.1,0))
        panel(stile,fh-2*rail,.025,x-fw/2+stile/2,upper_y,upper_front_z,f'HC_UPPER_FRONTS__U{i}_GLASS_LEFT','HC_UPPER_FRONTS',0.0015,'front',(1.7,2.7),(i*.1,0))
        panel(stile,fh-2*rail,.025,x+fw/2-stile/2,upper_y,upper_front_z,f'HC_UPPER_FRONTS__U{i}_GLASS_RIGHT','HC_UPPER_FRONTS',0.0015,'front',(1.7,2.7),(i*.1,0))
        panel(fw-.078,fh-.078,.008,x,upper_y,upper_front_z+.006,f'HC_GLASS__U{i}_PANE','HC_GLASS',0.0005,'front')
        panel(fw-.11,fh-.11,.010,x,upper_y,-1.952,f'HC_DARK__U{i}_GLASS_BACK','HC_DARK',0.001,'front')
        # interior shelves / depth
        for sy in (2.02,2.30):
            panel(W-.09,.012,.31,x,sy,-1.76,f'HC_CARCASS__U{i}_SHELF_{int(sy*100)}','HC_CARCASS',0.0008,'top')
        hx=x+fw/2-.072
        cylinder(.009,.18,hx,upper_y,upper_front_z+.033,'y',f'HC_HANDLES__U{i}_GLASS_BAR','HC_HANDLES',18)
    else:
        panel(W-.012,.814,.020,x,upper_y,upper_front_z,f'HC_UPPER_FRONTS__U{i}_DOOR','HC_UPPER_FRONTS',0.0021,'front',(1.75,2.8),(i*.11,.05))
        hx=x+W/2-.075
        cylinder(.010,.34,hx,upper_y,upper_front_z+.035,'y',f'HC_HANDLES__U{i}_DOOR_BAR','HC_HANDLES',20)
        cylinder(.008,.045,hx,upper_y-.11,upper_front_z+.012,'z',f'HC_HANDLES__U{i}_DOOR_MOUNT_1','HC_HANDLES',16)
        cylinder(.008,.045,hx,upper_y+.11,upper_front_z+.012,'z',f'HC_HANDLES__U{i}_DOOR_MOUNT_2','HC_HANDLES',16)

# end panels + top/bottom finishing rails
panel(.025,1.03,.65,-2.02,.59,-1.66,'HC_CARCASS__BASE_END_LEFT','HC_CARCASS',0.0015,'side')
panel(.025,1.03,.65,1.98,.59,-1.66,'HC_CARCASS__BASE_END_RIGHT','HC_CARCASS',0.0015,'side')
panel(.025,.90,.43,-2.02,upper_y,-1.76,'HC_CARCASS__UPPER_END_LEFT','HC_CARCASS',0.0015,'side')
panel(.025,.90,.43,1.98,upper_y,-1.76,'HC_CARCASS__UPPER_END_RIGHT','HC_CARCASS',0.0015,'side')
panel(4.08,.026,.43,-.02,2.62,-1.76,'HC_CARCASS__UPPER_CROWN_REVEAL','HC_CARCASS',0.0015,'top')

# ---------- tall unit / appliance ----------
tx=2.46; tw=.88; th=2.84; tz=-1.68
panel(.022,th,.68,tx-tw/2+.011,1.42,tz,'HC_CARCASS__TALL_LEFT','HC_CARCASS',0.0015,'side')
panel(.022,th,.68,tx+tw/2-.011,1.42,tz,'HC_CARCASS__TALL_RIGHT','HC_CARCASS',0.0015,'side')
panel(tw-.044,.022,.68,tx,.011,tz,'HC_CARCASS__TALL_BOTTOM','HC_CARCASS',0.0015,'top')
panel(tw-.044,.022,.68,tx,2.829,tz,'HC_CARCASS__TALL_TOP','HC_CARCASS',0.0015,'top')
panel(tw-.044,th-.05,.012,tx,1.42,-2.016,'HC_CARCASS__TALL_BACK','HC_CARCASS',0.0008,'front')
# upper tall door and lower drawer with real gaps
panel(tw-.014,1.305,.020,tx,2.12,-1.325,'HC_TALL_FRONTS__UPPER_DOOR','HC_TALL_FRONTS',0.0022,'front',(1.8,3.0),(.33,.05))
panel(tw-.014,.285,.020,tx,.205,-1.325,'HC_TALL_FRONTS__LOWER_DRAWER','HC_TALL_FRONTS',0.0022,'horizontal_front',(1.8,3.0),(.14,.31))
# oven recess surround + appliance
panel(tw-.08,.035,.035,tx,1.40,-1.318,'HC_CARCASS__OVEN_TOP_REVEAL','HC_CARCASS',0.0012,'front')
panel(tw-.08,.035,.035,tx,.445,-1.318,'HC_CARCASS__OVEN_BOTTOM_REVEAL','HC_CARCASS',0.0012,'front')
panel(.035,.92,.035,tx-tw/2+.055,.92,-1.318,'HC_CARCASS__OVEN_LEFT_REVEAL','HC_CARCASS',0.0012,'front')
panel(.035,.92,.035,tx+tw/2-.055,.92,-1.318,'HC_CARCASS__OVEN_RIGHT_REVEAL','HC_CARCASS',0.0012,'front')
panel(.70,.84,.035,tx,.92,-1.295,'HC_APPLIANCE__OVEN_GLASS','HC_APPLIANCE',0.0025,'front')
panel(.64,.095,.020,tx,1.28,-1.270,'HC_APPLIANCE__OVEN_CONTROL','HC_APPLIANCE',0.002,'front')
cylinder(.026,.030,tx-.15,1.28,-1.245,'z','HC_APPLIANCE__OVEN_KNOB_L','HC_APPLIANCE',24)
cylinder(.026,.030,tx+.15,1.28,-1.245,'z','HC_APPLIANCE__OVEN_KNOB_R','HC_APPLIANCE',24)
# appliance detailing: real handle, control display and ventilation slots
cylinder(.012,.49,tx,1.145,-1.238,'x','HC_METAL__OVEN_HANDLE','HC_METAL',24)
panel(.17,.036,.010,tx,1.28,-1.238,'HC_DARK__OVEN_DISPLAY','HC_DARK',0.001,'front')
for j in range(5):
    panel(.46,.006,.008,tx,1.365+j*.010,-1.240,f'HC_DARK__OVEN_VENT_{j+1}','HC_DARK',0.0005,'front')
# dark recess behind the appliance prevents a pasted-on black rectangle read
panel(.74,.89,.012,tx,.92,-1.333,'HC_DARK__OVEN_RECESS','HC_DARK',0.001,'front')
cylinder(.010,.36,tx,2.12,-1.287,'y','HC_HANDLES__TALL_DOOR_BAR','HC_HANDLES',20)
cylinder(.010,.30,tx,.205,-1.287,'x','HC_HANDLES__TALL_DRAWER_BAR','HC_HANDLES',20)

# ---------- sink: actual open bowl + rim ----------
outer=cq.Workplane('XY').box(.66,.30,.40,centered=(True,True,True)).edges().fillet(.022)
inner=cq.Workplane('XY').box(.57,.31,.31,centered=(True,True,True)).edges().fillet(.018).translate((0,.060,0))
sink=outer.cut(inner).translate((-1.30,.88,-1.59)).val()
solid_to_mesh(sink,'HC_METAL__SINK_BOWL','HC_METAL','top',(1.3,1.0),(0,0),0.0040,0.25)
panel(.50,.012,.25,-1.30,.735,-1.59,'HC_DARK__SINK_BASE_SHADOW','HC_DARK',0.010,'top')
cylinder(.018,.010,-1.30,.746,-1.59,'y','HC_METAL__SINK_DRAIN','HC_METAL',28)
# rim as four bars slightly above slab
panel(.70,.008,.024,-1.30,1.050,-1.388,'HC_METAL__SINK_RIM_FRONT','HC_METAL',0.001,'top')
panel(.70,.008,.024,-1.30,1.050,-1.792,'HC_METAL__SINK_RIM_BACK','HC_METAL',0.001,'top')
panel(.024,.008,.38,-1.638,1.050,-1.59,'HC_METAL__SINK_RIM_LEFT','HC_METAL',0.001,'top')
panel(.024,.008,.38,-.962,1.050,-1.59,'HC_METAL__SINK_RIM_RIGHT','HC_METAL',0.001,'top')

# faucet stem + authored curved spout + lever
cylinder(.023,.46,-1.30,1.29,-1.91,'y','HC_METAL__FAUCET_STEM','HC_METAL',28)
t=np.linspace(0,1,28)
p0=np.array([-1.30,1.52,-1.91]); p1=np.array([-1.30,1.78,-1.91]); p2=np.array([-1.30,1.80,-1.61]); p3=np.array([-1.30,1.56,-1.56])
pts=((1-t)**3)[:,None]*p0 + (3*(1-t)**2*t)[:,None]*p1 + (3*(1-t)*t**2)[:,None]*p2 + (t**3)[:,None]*p3
tube_path(pts,.020,'HC_METAL__FAUCET_SPOUT','HC_METAL',16)
cylinder(.008,.12,-1.255,1.35,-1.91,'x','HC_METAL__FAUCET_LEVER','HC_METAL',18)

# cooktop with inset glass and burner zones
panel(.68,.009,.52,.82,1.048,-1.61,'HC_DARK__COOKTOP_RECESS','HC_DARK',0.002,'top')
panel(.64,.010,.48,.82,1.052,-1.61,'HC_APPLIANCE__COOKTOP_GLASS','HC_APPLIANCE',0.003,'top')
for j,(dx,dz,r) in enumerate([(-.16,-.11,.09),(.14,-.10,.075),(-.14,.13,.07),(.16,.13,.09)],1):
    # thin burner disks (cylinder along Y)
    cylinder(r,.003,.82+dx,1.059,-1.61+dz,'y',f'HC_APPLIANCE__COOKTOP_RING_{j}','HC_APPLIANCE',32)

# Under-cabinet light extrusion; emissive material is assigned at runtime.
panel(3.88,.010,.018,-.02,1.735,-1.515,'HC_LIGHT__UNDERCABINET','HC_LIGHT',0.001,'front')

# ---------- export ----------
out=ASSETS/'higher-class-fixed-kitchen-v3.glb'
scene.export(out,file_type='glb',include_normals=True)

# validation summary
loaded=trimesh.load(out,force='scene')
names=list(loaded.graph.nodes_geometry)
print('GLB',out,out.stat().st_size)
print('parts',part_count,'nodes',len(names),'geometries',len(loaded.geometry))
from collections import Counter
zones=Counter(n.split('__')[0] for n in names)
print('zones',dict(zones))
# write machine-readable manifest
import json
manifest={'file':out.name,'bytes':out.stat().st_size,'parts':part_count,'nodes':len(names),'zones':dict(zones),'source':'CadQuery B-rep solids tessellated to glTF; client images used only for derived PBR maps.'}
(ASSETS/'higher-class-fixed-kitchen-v3.manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')