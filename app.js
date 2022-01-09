var express = require('express');
var app = express();
var mysql=require('mysql')
var parser = require('body-parser');
var cors = require('cors')
var bcrypt=require('bcrypt');
var path=require('path')
var session=require('express-session')
const con = mysql.createConnection({
    host: 'localhost', user: 'root',database: 'todo'
    });
app.set('view engine','pug')
app.use(cors()) 
app.use(express.static(path.join(__dirname, 'public')));
app.use(parser.urlencoded({
    extended: true
  }));
app.use(session({//https://www.npmjs.com/package/express-session
    secret: 'wreuihwey',
    resave: false,
    saveUninitialized: true,
  }))
app.get('/registracija',function(req,res)
{
    if(typeof req.session.korisnik_id=='undefined')
    {
        res.render('registracija');
    }
    else
    {
        res.redirect('/')
    }
})
app.post('/registracija', async function(req, res) 
{
        var korisnicko_ime=req.body.KorisnickoIme;
        var lozinka=req.body.Lozinka;
        var salt = await bcrypt.genSalt(10);
        var hesovana_lozinka = await bcrypt.hash(lozinka, salt);
        var email=req.body.mail;
        let upit = `INSERT INTO korisnici (korisnicko_ime,lozinka,email) VALUES(?,?,?)`;
        con.query( upit,[korisnicko_ime,hesovana_lozinka,email], function(err, redovi) 
        {
            if (err)
            {
                //res.render('prikaz',{greska:'Dogodila se greška.Pokušajte kasnije.'});
                var poruka="Korisničko ime je zauzeto.";
                res.render('registracija',{tekst_greske:poruka});

            }
            else
            {
                res.redirect('/');
            }
            //var row=redovi[0];//posto uvek vraca niz,a mi selektujemo samo 1 proizvod,tako da ce u ovom slucaju uvek vratiti samo 1 element u nizu
            //res.render('prikaz',{proizvod:row});
            
            
        });
});
app.get('/prijava',function(req,res)
{
    if(typeof req.session.korisnik_id=='undefined')
    {
        
        res.render('prijava');
    }
    else
    {
        res.redirect('/')
    }
})
app.post('/odjava',function(req,res)
{
    req.session.korisnik_id=undefined;
    res.redirect('/prijava')
})
app.post('/prijava', async function(req, res) 
{
        var korisnicko_ime=req.body.KorisnickoIme;
        var lozinka=req.body.Lozinka;
        let upit = `SELECT * FROM korisnici WHERE korisnicko_ime=?`;
        con.query( upit,[korisnicko_ime,lozinka], async function(err, redovi) 
        {
            if (err)
            {
                res.end("Dogodila se greška")
            }
            var broj_redova=redovi.length;
            if(broj_redova>0)//mogao sam i ==1 posto u svakom slucaju samo jedan korisnik postoji sa tom kombinacijom
            {
                var korisnik=redovi[0];//posto vraca samo jedan red koji sadrzi info o korisniku
                
                var tacna_sifra= await bcrypt.compare(lozinka, korisnik.lozinka);
                if(tacna_sifra==true)
                {
                    req.session.korisnik_id=korisnik.id;
                    res.redirect('/');
                }
                else
                {
                    var poruka="Pogrešno korisničko ime ili lozinka";
                    res.render('prijava',{tekst_greske:poruka});
                }
                
            }
            else
            {
                var poruka="Pogrešno korisničko ime ili lozinka";
                res.render('prijava',{tekst_greske:poruka});
            }
            
        });
});
app.get('/test',function(req,res)
{
    res.end(JSON.stringify(req.session.korisnik_id));
})
app.post('/dodajtodo', function(req, res) 
{
    var tekst=req.body.tekst;
    var korisnik_id=req.session.korisnik_id;
    let upit = `INSERT INTO todo (tekst,korisnik_id,vreme_kreiranja) VALUES(?,?,NOW())`;
    con.query( upit,[tekst,korisnik_id], function(err,sql_odgovor) 
    {
        
        if (err)
        {
            //res.render('prikaz',{greska:'Dogodila se greška.Pokušajte kasnije.'});
            res.send({greska:"Dogodila se greška"})

        }
        res.send({poruka:'Todo uspešno dodat',id:sql_odgovor.insertId});
        //var row=redovi[0];//posto uvek vraca niz,a mi selektujemo samo 1 proizvod,tako da ce u ovom slucaju uvek vratiti samo 1 element u nizu
        //res.render('prikaz',{proizvod:row});
        
        
    });
});
app.get('/',function(req,res)
{
    if(typeof req.session.korisnik_id=='undefined')
    {
        res.redirect('/prijava');
    }
    else
    {
        res.render('todo');
    }
})
app.get('/prikazitodo', function(req, res) 
{
        var korisnik_id=req.session.korisnik_id;
        let upit = `SELECT *,DATE_FORMAT(vreme_kreiranja, "%d.%m.%Y %H:%i") as vreme_kreiranja,DATE_FORMAT(vreme_kompletiranja, "%d.%m.%Y %H:%i") as vreme_kompletiranja FROM todo WHERE korisnik_id=?`;
        con.query( upit,[korisnik_id], function(err, redovi) 
        {
            if (err)
            {
                //res.render('prikaz',{greska:'Dogodila se greška.Pokušajte kasnije.'});
                res.send({greska:"Dogodila se greska"});
            }
            //var row=redovi[0];//posto uvek vraca niz,a mi selektujemo samo 1 proizvod,tako da ce u ovom slucaju uvek vratiti samo 1 element u nizu
            //res.render('prikaz',{proizvod:row});
            var broj_redova=redovi.length;
            res.send({todo_lista:redovi});
            
        });
});
app.post('/obrisitodo/:id', function(req, res) 
{
        var korisnik_id=req.session.korisnik_id;
        var id=req.params.id;
        let upit = `DELETE FROM todo WHERE id=? AND korisnik_id=?`;
        con.query( upit,[id,korisnik_id], function(err, redovi) 
        {
            if (err)
            {
                //res.render('prikaz',{greska:'Dogodila se greška.Pokušajte kasnije.'});
                res.send({greska:"Dogodila se greška"});
            }
            res.send({poruka:"TODO uspešno obrisan"});
            
        });
});
app.post('/kompletirajtodo/:id', function(req, res) 
{
        var korisnik_id=req.session.korisnik_id;
        var id=req.params.id;
        var tekst=req.body.tekst;
        let upit = `UPDATE todo SET vreme_kompletiranja=NOW() WHERE id=? AND korisnik_id=?`;
        con.query( upit,[id,korisnik_id], function(err, redovi) 
        {
            if (err)
            {
                //res.render('prikaz',{greska:'Dogodila se greška.Pokušajte kasnije.'});
                res.send({greska:"Dogodila se greška"});
            }
            res.send({poruka:"TODO uspešno kompletiran"});
            
        });
});
app.get('/prosecnovreme', function(req, res) 
{
        var korisnik_id=req.session.korisnik_id;
        let upit = `SELECT FLOOR(SUM(TIMESTAMPDIFF(MINUTE,vreme_kreiranja,vreme_kompletiranja))/COUNT(*)) as prosecno_vreme,COUNT(*) as broj_zadataka FROM todo WHERE korisnik_id=? AND vreme_kompletiranja IS NOT NULL`;
        con.query(upit,[korisnik_id], function(err, redovi) 
        {
            if (err || typeof redovi=='undefined')
            {
                console.log(err)
                //res.render('prikaz',{greska:'Dogodila se greška.Pokušajte kasnije.'});
                res.send({greska:"Dogodila se greška"});
                return;
            }
            let prosecno_vreme_kompletiranja_u_minutima=0;
            if(redovi[0].prosecno_vreme_kompletiranja!=null)
            {
                prosecno_vreme_kompletiranja_u_minutima=redovi[0].prosecno_vreme;
            }
            let broj_zadataka=redovi[0].broj_zadataka;
            let prosecno_vreme_poruka="";
            let sati=Math.floor(prosecno_vreme_kompletiranja_u_minutima/60);
            let minuti=prosecno_vreme_kompletiranja_u_minutima%60;
            let sati_tekst='sati';
            let minuti_tekst='minuta';
            let sati_moduo_10=sati%10;
            if(sati>=10 && sati<20)
            {
                sati_tekst='sati';
            }
            else if(sati_moduo_10>=2 && sati_moduo_10<=4)
            {
                sati_tekst='sata';
            }
            else if(sati_moduo_10==1)
            {
                sati_tekst='sat';
            }
            if(minuti%10==1)
            {
                minuti_tekst='minut';
            }
            if(prosecno_vreme_kompletiranja_u_minutima>0 || broj_zadataka>0)
            {
                if(sati==0)
                {
                    prosecno_vreme_poruka=`Prosečno vreme kompletiranja je ${minuti} ${minuti_tekst}`
                }
                else
                {
                    prosecno_vreme_poruka=`Prosečno vreme kompletiranja je ${sati} ${sati_tekst} i ${minuti} ${minuti_tekst}`
                }
            }
            res.send(prosecno_vreme_poruka);
        });
});
app.listen(3000);