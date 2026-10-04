from pathlib import Path
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import shutil
from scipy.ndimage import gaussian_filter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'; OUT.mkdir(parents=True,exist_ok=True)
SRC=ROOT/'source-assets'
wood_path=SRC/'client-light-wood-original.jpeg'
sage_path=SRC/'client-sage-original.jpeg'
wood=Image.open(wood_path).convert('RGB')
sage=Image.open(sage_path).convert('RGB')
# Preserve original exact uploads as original references
shutil.copyfile(wood_path,OUT/'client-light-wood-original.jpeg')
shutil.copyfile(sage_path,OUT/'client-sage-original.jpeg')

# Albedo: preserve character, only light normalization / resizing for GPU use.
def resize_keep(img,max_h=1536):
    if img.height<=max_h:return img.copy()
    w=round(img.width*max_h/img.height);return img.resize((w,max_h),Image.Resampling.LANCZOS)

wood_a=resize_keep(wood,768)
# very mild local contrast reduction to avoid baked photo contrast while preserving species/colour
wood_a=ImageEnhance.Contrast(wood_a).enhance(.94)
wood_a=ImageEnhance.Color(wood_a).enhance(.96)
wood_a.save(OUT/'client-light-wood-albedo.webp','WEBP',quality=92,method=6)

sage_a=resize_keep(sage,768)
sage_a=ImageEnhance.Contrast(sage_a).enhance(.88)
sage_a=ImageEnhance.Color(sage_a).enhance(.95)
sage_a.save(OUT/'client-sage-albedo.webp','WEBP',quality=92,method=6)

# Support maps: non-colour rendering aids, deliberately restrained.
def make_support(img,prefix,rough_base,normal_strength):
    arr=np.asarray(img.resize((512,512),Image.Resampling.LANCZOS).convert('L'),dtype=np.float32)/255.0
    low=gaussian_filter(arr, sigma=18)
    micro=arr-low
    micro/=max(float(np.std(micro))*5,1e-4)
    micro=np.clip(micro,-1,1)
    rough=np.clip(rough_base + micro*0.035,0,1)
    Image.fromarray((rough*255).astype(np.uint8),'L').save(OUT/f'{prefix}-roughness.webp','WEBP',quality=90,method=6)
    # very subtle normal from blurred micro detail
    h=gaussian_filter(arr, sigma=1.15)
    gy,gx=np.gradient(h)
    nx=-gx*normal_strength; ny=-gy*normal_strength; nz=np.ones_like(nx)
    norm=np.sqrt(nx*nx+ny*ny+nz*nz); nx/=norm; ny/=norm; nz/=norm
    rgb=np.dstack(((nx*.5+.5),(ny*.5+.5),(nz*.5+.5)))
    Image.fromarray(np.clip(rgb*255,0,255).astype(np.uint8),'RGB').save(OUT/f'{prefix}-normal.webp','WEBP',quality=90,method=6)

make_support(wood_a,'client-light-wood',.62,2.1)
make_support(sage_a,'client-sage',.72,.75)

# Quiet illustrative stone PBR: irregular large-scale variation, sparse non-uniform veins, no obvious scribble tiling.
rng=np.random.default_rng(43); N=512
y,x=np.mgrid[0:N,0:N]
base=np.full((N,N,3),[0.79,0.78,0.75],dtype=np.float32)
noise=gaussian_filter(rng.normal(0,1,(N,N)),sigma=46);noise=(noise-noise.mean())/(noise.std()+1e-6)
base+=noise[...,None]*.018
# sparse veins using warped fields
vein=np.zeros((N,N),dtype=np.float32)
for k in range(5):
    slope=rng.uniform(-.55,.48); intercept=rng.uniform(-100,N+100); amp=rng.uniform(10,28); freq=rng.uniform(.004,.011)
    curve=intercept+slope*x+amp*np.sin(x*freq+rng.uniform(0,6.28))
    dist=np.abs(y-curve)
    width=rng.uniform(1.4,4.2)
    vein+=np.exp(-(dist/width)**2)*rng.uniform(.25,.65)
vein=np.clip(vein,0,1)
base-=vein[...,None]*np.array([.12,.105,.09])[None,None,:]
base=np.clip(base,0,1)
Image.fromarray((base*255).astype(np.uint8),'RGB').save(OUT/'stone-albedo.webp','WEBP',quality=90,method=6)
rough=np.clip(.60 + noise*.018 + vein*.055,0,1)
Image.fromarray((rough*255).astype(np.uint8),'L').save(OUT/'stone-roughness.webp','WEBP',quality=90,method=6)
h=gaussian_filter(vein,sigma=2.2);gy,gx=np.gradient(h); strength=1.2
nx=-gx*strength;ny=-gy*strength;nz=np.ones_like(nx);norm=np.sqrt(nx*nx+ny*ny+nz*nz);rgb=np.dstack((nx/norm*.5+.5,ny/norm*.5+.5,nz/norm*.5+.5))
Image.fromarray((np.clip(rgb,0,1)*255).astype(np.uint8),'RGB').save(OUT/'stone-normal.webp','WEBP',quality=90,method=6)

# floor: warm large-format porcelain, subtle variation
N=1024;rng=np.random.default_rng(11)
N=512
noise=gaussian_filter(rng.normal(0,1,(N,N)),sigma=24);noise=(noise-noise.mean())/(noise.std()+1e-6)
f=np.full((N,N,3),[.43,.415,.395],dtype=np.float32)+noise[...,None]*.022
# grout lines baked very lightly in large tile texture
for pos in [0,255,511]:
    if pos<N: f[max(0,pos-1):min(N,pos+2),:]*=.82; f[:,max(0,pos-1):min(N,pos+2)]*=.82
Image.fromarray((np.clip(f,0,1)*255).astype(np.uint8),'RGB').save(OUT/'floor-albedo.webp','WEBP',quality=88,method=6)
Image.fromarray((np.full((N,N),205,dtype=np.uint8)),'L').save(OUT/'floor-roughness.webp','WEBP',quality=86,method=6)

for p in sorted(OUT.glob('*')): print(p.name,p.stat().st_size)
