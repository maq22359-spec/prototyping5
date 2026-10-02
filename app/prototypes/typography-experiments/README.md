# typography-experiments / 字体实验

A bilingual poster playground built from `app/prototypes/_template`.
从项目模板创建的中英文字体海报实验。

## Run / 运行

From the project root, run `npm run dev`, then open `/prototypes/typography-experiments` or use the homepage link.
在项目根目录运行 `npm run dev`，然后打开 `/prototypes/typography-experiments`，也可以从首页进入。

## Controls / 操作

- Type up to 80 characters. Short words make the bread texture and pores easier to see. Line breaks are kept in the poster.
  输入最多 80 个字符；短词更能看清面包纹理和气孔，换行会保留在海报里。
- Choose Original bread, Bread wave, Bread orbit, or Bread perspective. All four layouts use the same photographed bread alphabet.
  可选择原味、波浪、环绕或倾斜排版；四种模式都使用同一套面包字母照片。
- Click **Toast the bread / 烘烤面包** to crossfade into a visibly charred version of the letters. Click **Fresh again / 恢复原味** to reset. The toasted state stays active when you switch layouts.
  点击“烘烤面包”，字母会逐渐变成带有焦黑斑块的面包；点击“恢复原味”重来。切换排版时会保留烘烤状态。
- Switch between Chinese and English, adjust the variable font and distortion, toggle motion, or print the poster.
  可切换中英文、调整可变字体与变形程度、开关动态效果，或打印海报。

For A–Z, CSS positions the exact hand-cut bread letters from the supplied alphabet reference inside responsive letter spans. A second, image-generated version of that same alphabet adds photographic black char and dark amber crust; CSS fades between the two images. Chinese and unsupported characters use the supplied bread photograph as a CSS text fill, with varied gradient pores, clipping and layered shadows. The black background follows the original reference. No graphics or animation library is used by this prototype.
对于 A–Z，CSS 会在响应式字母容器里定位用户参考图中原本的面包字母；另一张由图像生成工具制作的同版字母照片提供焦黑斑块和深琥珀色表皮，CSS 在两张图片之间过渡。中文与其他未收录字符仍使用用户提供的面包照片作为 CSS 字形填充，并叠加渐变气孔、裁切和阴影。黑色背景呼应最初的参考图。本原型不使用图形或动画库。

Bricolage Grotesque is bundled locally with its SIL Open Font License. Its variable axes affect unsupported Latin characters; the photographed A–Z keeps its original shape, and Chinese falls back to a system font. All prototype styles stay in the local CSS Module.
Bricolage Grotesque 可变字体及其 SIL Open Font License 保存在本地；可变轴作用于未收录的拉丁字符，照片中的 A–Z 保持原始形状，中文使用系统字体。所有样式都保留在原型自己的 CSS Module 中。
