const fs = require('fs');
const content = fs.readFileSync('D:/yunami/hasil_bumi/frontend/utils/supabase/info.tsx', 'utf8');
const urlMatch = content.match(/createClient\((['"`])(.*?)\1,\s*(['"`])(.*?)\3/);
if (urlMatch) {
    const url = urlMatch[2];
    const key = urlMatch[4];
    fetch(url + '/rest/v1/pesanan?select=*&order=created_at.desc&limit=5', {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
    })
    .then(res => res.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(e => console.error(e));
} else {
    console.error('Could not parse supabase URL');
}
