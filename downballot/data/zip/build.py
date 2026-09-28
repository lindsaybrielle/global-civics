# Rebuilds data/zip/*.js: ZIP code -> 2026 U.S. House district(s).
# 1. Download the boundaries from Census TIGERweb (tigerWMS_Current) into zc/:
#    B=https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer
#    curl "$B/54/query?where=1%3D1&outFields=GEOID,CD120,STATE&returnGeometry=true&maxAllowableOffset=0.001&outSR=4326&f=geojson" -o zc/cd.json
#    for off in $(seq 0 2000 32000); do curl "$B/2/query?where=1%3D1&outFields=ZCTA5&returnGeometry=true&maxAllowableOffset=0.001&outSR=4326&resultOffset=$off&resultRecordCount=2000&orderByFields=ZCTA5&f=geojson" -o zc/z$off.json; done
# 2. pip install shapely, then run this script from the folder holding zc/, and
#    write the shards with the snippet at the bottom.
import json,glob
from shapely.geometry import shape
from shapely.strtree import STRtree
from shapely.validation import make_valid
FIPS={'01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY'}
cds=[];labels=[]
for f in json.load(open('zc/cd.json'))['features']:
    st=FIPS.get(f['properties']['STATE'])
    if not st: continue
    n=f['properties']['CD120']
    d=0 if n in('00','98','ZZ') else int(n)
    if n=='ZZ': continue
    cds.append(make_valid(shape(f['geometry']))); labels.append(st+str(d))
tree=STRtree(cds)
out={};multi=0;none=0
for fn in sorted(glob.glob('zc/z*.json')):
    for f in json.load(open(fn))['features']:
        z=f['properties']['ZCTA5']; g=make_valid(shape(f['geometry'])); A=g.area or 1e-12
        hits=[]
        for i in tree.query(g):
            a=g.intersection(cds[i]).area/A
            if a>=0.02: hits.append((a,labels[i]))
        hits.sort(reverse=True)
        if not hits: none+=1; continue
        if len(hits)>1: multi+=1
        out[z]=' '.join(l for a,l in hits)
print(len(out),'zips',multi,'multi',none,'none')
json.dump(out,open('zc/zip.json','w'),separators=(',',':'))

# Shards: one file per first digit, plus a 3-digit-prefix -> state fallback.
import collections
p = collections.defaultdict(collections.Counter)
for z, v in out.items(): p[z[:3]][v[:2]] += 1
shard = collections.defaultdict(dict)
for z, v in out.items(): shard[z[0]][z] = v
for k in '0123456789':
    z3 = {q: c.most_common(1)[0][0] for q, c in p.items() if q[0] == k}
    with open(f'{k}.js', 'w') as f:
        f.write('// ZIP code -> 2026 U.S. House districts (Census ZCTAs overlaid on the\n// 120th Congress district maps), largest overlap first. See README.md and data/zip/build.py.\n')
        f.write('window.ZIPS=Object.assign(window.ZIPS||{},' + json.dumps(shard[k], separators=(',', ':')) + ');\n')
        f.write('window.ZIP3=Object.assign(window.ZIP3||{},' + json.dumps(z3, separators=(',', ':')) + ');\n')
