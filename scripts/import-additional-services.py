"""Import the supplied automation and branding documents, preserving all paragraphs."""
import json
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parent.parent
CONFIGS=[
 ('CMR','crm-integration','CRM Integration & Implementation','marketing-business-automation','workflow','Connected customer systems','detail-analytics'),
 ('Lead Nurturing','lead-nurturing','Lead Nurturing','marketing-business-automation','target','Consistent customer follow-up','detail-campaign'),
 ('Workflow Automation','workflow-automation','Workflow Automation','marketing-business-automation','workflow','Reduce repetitive work','detail-laptop'),
 ('Brand Positioning Services','brand-positioning','Brand Strategy & Positioning','brand-management','compass','A clear market position','detail-strategy'),
 ('Brand Guidelines and Voice','brand-guidelines-voice','Brand Guidelines & Voice','brand-management','palette','A recognisable brand identity','detail-design'),
 ('Brand Consistency Across Digital Platforms','brand-consistency','Brand Consistency Across Digital Platforms','brand-management','layers-3','One connected brand experience','detail-creative'),
 ('Reputation Management','reputation-management','Reputation Management','brand-management','users','Build customer trust','detail-research'),
]
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def paragraphs(name):
 with zipfile.ZipFile(Path('D:/Downloads')/f'Services Pages Content _ {name} _ Eiretech360.docx') as document:
  tree=ET.fromstring(document.read('word/document.xml'))
 for p in tree.findall('.//w:body/w:p',NS):
  text=''.join(t.text or '' for t in p.findall('.//w:t',NS)).strip()
  if not text:continue
  style=p.find('w:pPr/w:pStyle',NS)
  yield text,style.get('{'+NS['w']+'}val','') if style is not None else ''

if __name__=='__main__':
 services=json.loads((ROOT/'content/services.json').read_text(encoding='utf-8'))
 for name,slug,title,parent,icon,tag,image in CONFIGS:
  intro=[];sections=[];headline=''
  for text,style in paragraphs(name):
   if not headline:headline=text
   elif style.startswith('Heading'):sections.append({'title':text,'body':[]})
   elif sections:sections[-1]['body'].append(text)
   else:intro.append(text)
  assert intro and sections,(name,'Missing document introduction or sections')
  entry={'title':title,'slug':slug,'parent':parent,'headline':headline,'icon':icon,'tag':tag,'image':image,'desc':intro[0],'intro':'\n\n'.join(intro),'points':[x['title'] for x in sections],'details':['\n\n'.join(x['body']) for x in sections],'seo':{'title':f'{title} | EireTech360','description':intro[0][:157]}}
  services=[s for s in services if s.get('slug')!=slug];services.append(entry)
  print(f'Imported {slug}: {len(sections)} sections')
 (ROOT/'content/services.json').write_text(json.dumps(services,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
