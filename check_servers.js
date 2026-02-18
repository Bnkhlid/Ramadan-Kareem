const https = require('https');

const reciters = [
    { name: 'Abdulbasit', server: 'https://server7.mp3quran.net/basit/' },
    { name: 'Basfar', server: 'https://server7.mp3quran.net/basfar/' },
    { name: 'Sudais', server: 'https://server7.mp3quran.net/sds/' },
    { name: 'Shatri', server: 'https://server11.mp3quran.net/shatri/' },
    { name: 'Alafasy', server: 'https://server8.mp3quran.net/afs/' },
    { name: 'Ghamdi', server: 'https://server7.mp3quran.net/s_gmd/' },
    { name: 'Rifai', server: 'https://server8.mp3quran.net/hani/' },
    { name: 'Husary', server: 'https://server13.mp3quran.net/husr/' },
    { name: 'Hudhaify', server: 'https://server7.mp3quran.net/hthfy/' },
    { name: 'Maher', server: 'https://server12.mp3quran.net/maher/' },
    { name: 'Minshawi', server: 'https://server10.mp3quran.net/minsh/' },
    { name: 'Tablawi', server: 'https://server12.mp3quran.net/tblawi/' },
    { name: 'Ayyoub', server: 'https://server16.mp3quran.net/ayyoub2/' },
    { name: 'Jibreel', server: 'https://server8.mp3quran.net/jbrl/' },
    { name: 'Shuraym', server: 'https://server7.mp3quran.net/shur/' },
    { name: 'Bukhatir', server: 'https://server11.mp3quran.net/bukhtr/' },
    { name: 'Muhsin', server: 'https://server8.mp3quran.net/qasm/' },
    { name: 'Juhany', server: 'https://server11.mp3quran.net/jhn/' },
    { name: 'Budair', server: 'https://server6.mp3quran.net/s_bud/' },
    { name: 'Matroud', server: 'https://server8.mp3quran.net/mtrod/' },
    { name: 'Abdulkareem', server: 'https://server12.mp3quran.net/m_krm/' },
    { name: 'Tunaiji', server: 'https://server12.mp3quran.net/tnjy/' },
    { name: 'Albanna', server: 'https://server8.mp3quran.net/bna/' },
    { name: 'Qahtani', server: 'https://server10.mp3quran.net/qht/' },
    { name: 'Dosari', server: 'https://server11.mp3quran.net/yasser/' },
    { name: 'Qatami', server: 'https://server6.mp3quran.net/qtm/' },
    { name: 'Suwaisy', server: 'https://server9.mp3quran.net/hajjaj/' },
    { name: 'Sahl', server: 'https://server6.mp3quran.net/shl/' },
    { name: 'Ajmy', server: 'https://server10.mp3quran.net/ajm/' },
    { name: 'Aziz', server: 'https://server8.mp3quran.net/aziz/' },
    { name: 'Akram', server: 'https://server9.mp3quran.net/akrm/' },
    { name: 'Fares', server: 'https://server8.mp3quran.net/frs_a/' }
];

console.log('Checking servers...');
reciters.forEach(r => {
    const url = r.server + '001.mp3';
    const req = https.request(url, { method: 'HEAD' }, (res) => {
        if (res.statusCode !== 200) {
            console.log(`[FAIL] ${r.name}: ${res.statusCode} - ${url}`);
        } else {
            // console.log(`[OK] ${r.name}`);
        }
    });
    req.on('error', (e) => {
        console.log(`[ERR] ${r.name}: ${e.message}`);
    });
    req.end();
});
