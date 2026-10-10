import fs from 'node:fs/promises';
import sharp from 'sharp';
const items=[['traditional-media','photo-1593359677879-a4bb92f829d1','Television in a living room'],['outdoor-print','photo-1504711434969-e33886168f5c','Printed newspapers'],['integrated-campaigns','photo-1531058020387-3be344556be6','Live event and presentation'],['campaign-planning','photo-1523958203904-cdcb402031fd','Planning a campaign at a desk']];
const sources=JSON.parse(await fs.readFile('content/photo-sources.json','utf8'));
for(const [name,id,subject] of items){const source=`https://images.unsplash.com/${id}`;const r=await fetch(`${source}?auto=format&fit=crop&w=1400&q=82`);if(!r.ok)throw new Error(`${name}: ${r.status}`);const file=`src/assets/photo-${name}.webp`;await sharp(Buffer.from(await r.arrayBuffer())).rotate().resize({width:1400,withoutEnlargement:true}).webp({quality:80}).toFile(file);sources.photos=sources.photos.filter(x=>x.file!==file);sources.photos.push({file,source,subject});console.log(`Saved ${name}`);}
await fs.writeFile('content/photo-sources.json',JSON.stringify(sources,null,2)+'\n');
