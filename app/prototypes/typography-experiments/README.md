# typography-experiments / 字体实验

A bilingual poster playground built from `app/prototypes/_template`.
从项目模板创建的中英文字体海报实验。

## Run / 运行

From the project root, run `npm run dev`, then open `/prototypes/typography-experiments` or use the homepage link.
在项目根目录运行 `npm run dev`，然后打开 `/prototypes/typography-experiments`，也可以从首页进入。

## Controls / 操作

- Type up to 80 characters. Short words make the bread texture and pores easier to see. Line breaks are kept in the poster.
  输入最多 80 个字符；短词更能看清面包纹理和气孔，换行会保留在海报里。
- Choose Bread type, Wave, Orbit, or Perspective. Bread type is the default.
  可选择面包字、波浪、环绕或立体倾斜；默认显示面包字。
- Switch between Chinese and English, adjust the variable font, distortion and colors, toggle motion, or print the poster.
  可切换中英文、调整可变字体与变形程度、更换颜色、开关动态效果，或打印海报。

For A–Z, CSS positions the exact hand-cut bread letters from the supplied alphabet reference inside responsive letter spans. This preserves their irregular outlines and natural pores. Chinese and unsupported characters use the supplied bread photograph as a CSS text fill, with varied gradient pores, clipping and layered shadows. The black background follows the original reference. No graphics or animation library is used by this prototype.
对于 A–Z，CSS 会在响应式字母容器里定位用户参考图中原本的面包字母，保留不规则外形和真实气孔。中文与其他未收录字符仍使用用户提供的面包照片作为 CSS 字形填充，并叠加不同大小的渐变气孔、裁切和阴影。黑色背景呼应最初的参考图。本原型不使用图形或动画库。

Bricolage Grotesque is bundled locally with its SIL Open Font License. Its variable axes affect Latin characters; Chinese falls back to a system font. All prototype styles stay in the local CSS Module.
Bricolage Grotesque 可变字体及其 SIL Open Font License 保存在本地；可变轴作用于拉丁字母，中文使用系统字体。所有样式都保留在原型自己的 CSS Module 中。
