cd "$(dirname "$0")"
for f in ../l2/fill/*.json; do l=$(basename $f .json); ALL=1 ONLY=$l KEYS=fill/$l.json OUT=$PWD/outfill python3 nllb.py 2>&1 | grep -v "^skip"; done
echo ALLDONE
