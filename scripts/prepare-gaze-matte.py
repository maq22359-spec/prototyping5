"""Pack the source gaze video and an exterior-white matte in one seekable MP4.
Requires cv2, numpy, imageio_ffmpeg. Does not recolour the face or regenerate it.
"""
from pathlib import Path
import cv2, numpy as np, subprocess, imageio_ffmpeg, sys
source=sys.argv[1]
root=Path(__file__).resolve().parents[1]/'public/videos/touch'
w,h=900,1200
cmd=[imageio_ffmpeg.get_ffmpeg_exe(),'-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{w*2}x{h}','-r','24','-i','-','-an','-c:v','libx264','-preset','fast','-crf','20','-g','1','-bf','0','-pix_fmt','yuv420p','-movflags','+faststart',str(root/'gaze-matte-v1.mp4')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
c=cv2.VideoCapture(source);n=0
while True:
 ok,im=c.read()
 if not ok: break
 im=cv2.resize(im,(w,h),interpolation=cv2.INTER_AREA)
 lo=im.min(axis=2).astype(float);hi=im.max(axis=2).astype(float)
 white=((lo>180)&((hi-lo)<48)).astype('uint8')
 _,labels=cv2.connectedComponents(white,connectivity=8)
 edge=np.unique(np.concatenate((labels[0,:],labels[:,0],labels[:,-1])))
 edge=edge[edge!=0]
 bg=np.isin(labels,edge).astype('uint8')
 # Tiny white gaps enclosed by strands at the outer edge are background too.
 xx=np.arange(w)[None,:]
 bg[(white>0)&((xx<w*.18)|(xx>w*.94))]=1
 # Exclude isolated highlights inside the face. Feather only exterior edges.
 fg=1-bg
 inner=cv2.distanceTransform(fg,cv2.DIST_L2,3)
 outer=cv2.distanceTransform(bg,cv2.DIST_L2,3)
 alpha=np.clip((inner-outer-.3)/2.2+.5,0,1)
 alpha=cv2.GaussianBlur(alpha,(3,3),.45)
 mask=np.repeat((alpha*255).astype('uint8')[:,:,None],3,axis=2)
 packed=np.concatenate((im,mask),axis=1)
 p.stdin.write(packed.tobytes())
 if n==80: cv2.imwrite(str(root/'gaze-matte-poster.jpg'),packed,[cv2.IMWRITE_JPEG_QUALITY,95])
 n+=1
p.stdin.close();assert p.wait()==0
print('Packed frames:',n)
