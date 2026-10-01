# typography-experiments / 字体实验

A bilingual poster playground built from `app/prototypes/_template`.
从项目模板创建的中英文字体海报实验。

## Run / 运行

From the project root, run `npm run dev`, open the homepage and choose
**Typography experiments / 字体实验**, or open `/prototypes/typography-experiments`.
在项目根目录运行 `npm run dev`，然后从首页进入「字体实验」。

No additional dependencies. React manages text and controls; CSS handles text layout,
transforms and motion. Dragon & Bread Type uses an original generated PNG illustration
on a parchment background. 没有新增依赖；排版和动画用 CSS，龙的插画是原创生成素材。

## Controls / 操作

- Enter up to 300 characters in Dragon & Bread Type, or choose Wave, Orbit, Perspective and Crumb.
  在龙与面包字中输入最多 300 个字符，也可选择波浪、环绕、立体倾斜或面包纹理。
- Switch between Chinese and English with the header button.
  点击顶部按钮切换中英文。
- Adjust font weight, width, optical size, distortion and colors.
  调整字重、宽度、视觉尺寸、变形程度和颜色。
- Motion starts on for the dragon and can be paused above the poster; it respects reduced-motion system preferences.
  龙默认有轻微浮动，可在海报上方暂停；动画遵循系统的减少动态效果设置。
- Print / Save PDF uses the browser's print dialog and a poster-only print style.
  打印 / 保存 PDF 使用浏览器打印窗口，只打印海报。

Bricolage Grotesque is bundled locally with its SIL Open Font License. Its variable
axes affect Latin characters; Chinese falls back to a system font. The Crumb
texture uses the supplied bread reference image. All styles stay in this prototype's
CSS Module. 模块化样式不会影响其他页面；可变字体对拉丁字母生效，中文使用系统字体。

The small dragon artwork was generated with the built-in ImageGen tool from this prompt: “One original miniature East Asian dragon, long horizontal S-curve, intricate black ink engraving with restrained burnt-red and antique-gold accents, flat warm parchment background, no text.” It is saved locally as `assets/dragon-small.png`. 小龙素材保存在 `assets/dragon-small.png`。

The Crumb treatment uses CSS sepia filtering to remove the purple patches from the reference image and layered shadows plus 3D transforms to give the letters depth. 面包模式通过 CSS 棕褐色滤镜去掉紫色，并用多层阴影与 3D 变换增加厚度。

Dragon & Bread Type repeats the entered text as a typographic field and leaves a winding series of gaps for the small dragon. CSS animates the dragon along those gaps; the existing bread reference supplies the letter texture. 龙与面包字会把输入文字排成多行，龙沿着字行留出的空隙游走。
