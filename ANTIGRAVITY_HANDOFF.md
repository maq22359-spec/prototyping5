# 网站项目资料 / Project map

这份资料只介绍网站的位置和结构，不分配任务，也不限定 Antigravity 或 Codex 的实现方式。

## 地址

| 项目 | 位置 |
| --- | --- |
| GitHub 仓库 | <https://github.com/maq22359-spec/prototyping5> |
| 正式网站 | <https://qianyima.vercel.app/> |
| Mac 上的代码仓库 | `/Users/maqianyi/Documents/prototyping5` |
| 本地开发地址 | <http://localhost:3000/>（仅在开发服务器运行的电脑上有效） |
| 默认分支 | `main`，与 Vercel 部署相连 |

Mac 和 Windows 上的本地文件不会因登录同一账号而自动同步。推送到 GitHub 的提交可以在另一台电脑获取；未推送的改动只存在于原来的电脑上。

## 项目技术

这是 npm 项目，使用 Node.js 24、Next.js 15、React 19 和 TypeScript，没有使用 Vite。项目依赖中已有 Three.js、GSAP（包括 ScrollTrigger）和 PixiJS。`package.json` 中提供 `dev`、`build` 等 npm 脚本。

## 页面与文件

| 页面或内容 | 主要位置 |
| --- | --- |
| `/` 首页布局、作品入口 | `app/page.tsx`、`app/styles/home.module.css` |
| 首页第一屏的人物、眼睛跟随和手绘元素 | `app/touch/TouchScene.tsx`、`app/touch/OrbitSketches.tsx`、`app/touch/gazeRenderer.ts`、`app/touch/touch.module.css` |
| `/airbuy` 品牌作品 | `app/airbuy/` |
| `/salome` 蓝色实验影像作品 | `app/salome/` |
| `/mushroom` 蘑菇书作品 | `app/mushroom/` |
| `/name` 雨滴与姓名交互 | `app/name/` |
| `/three-lab` 3D 镜头滚动实验 | `app/three-lab/` |
| `/touch`、`/touch-lab` 人物交互实验 | `app/touch/`、`app/touch-lab/` |
| 字体和泡泡游戏实验 | `app/prototypes/typography-experiments/`、`app/prototypes/bubble-chain/` |
| 图片和视频素材 | `public/images/`、`public/videos/` |
| 全局布局、字体和样式 | `app/layout.tsx`、`app/fonts.ts`、`app/styles/globals.css` |

交互组件中可以看到 Next.js 的 `"use client"` 标记。网页中使用的图片和视频来自 `public/`，代码里对应的路径通常以 `/images/` 或 `/videos/` 开头。
