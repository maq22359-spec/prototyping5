# PokéAPI Data Lab / 宝可梦 API 实验室

This bilingual prototype starts with the [PokéAPI Ditto endpoint](https://pokeapi.co/api/v2/pokemon/ditto). A centered collectible-style card sits in a dark radial-gradient showcase, surrounded by transparent Pokémon artwork from the PokéAPI sprites repository. Edit the Pokémon name at the end of the request URL or browse 48 examples in eight type groups; clicking a name fetches its data. The card color changes with the Pokémon, and its artwork, HP, ability, and move come from the response. Scroll below the showcase for the existing height, weight, type, and full stats. The form switches between images already in the response. Expand the JSON panel to see where the data came from. This is a read-only API demonstration; it does not change PokéAPI's database. No API key is needed.

这个中英文原型从 [PokéAPI 百变怪接口](https://pokeapi.co/api/v2/pokemon/ditto) 开始。卡牌位于黑色向外渐变的主视觉中央，周围使用 PokéAPI 图片围出一圈。可以修改网址最后的名字，也可以浏览八个属性分类中的 48 只宝可梦，点击名字就会请求资料。页面会更新原创卡牌的图片、生命值、特性、招式和配色。向下滚动仍可查看身高、体重、属性和完整能力值。形态按钮只切换返回数据里已有的图片。展开 JSON 区域可查看数据来源。这个页面只能读取数据，不能修改 PokéAPI 的数据库；也不需要密钥。

## Run locally / 本地运行

From the repository root, run `npm install` and `npm run dev`, then open `http://localhost:3000/prototypes/ditto-lab`.

在仓库根目录运行 `npm install` 和 `npm run dev`，然后打开 `http://localhost:3000/prototypes/ditto-lab`。
