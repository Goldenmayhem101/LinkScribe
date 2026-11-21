cd "$(dirname "$0")"
for f in ../l2/fill3/*.json; do l=$(basename $f .json); RAWPH=1 ALL=1 ONLY=$l KEYS=fill3/$l.json OUT=$PWD/outfill3 python3 nllb.py 2>&1 | grep -v "^skip"; done
echo ALLDONE
