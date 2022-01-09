function ValidacijaLoginForme(Forma)
{
    
	if (Forma.KorisnickoIme.value == "")
	{
	alert("Upišite Vaše korisničko ime!");
	return(false)
	}
    if (Forma.Lozinka.value=="")
    {
    alert("Unesite Vašu lozinku!");
    return(false)
    }

return(true);
}
function ValidacijaFormeZaRegistraciju(Forma)
{
	if (Forma.KorisnickoIme.value == "")
	{
	alert("Upišite Vaše korisničko ime!");
	return(false)
	}

    if (Forma.Lozinka.value=="")
    {
    alert("Unesite Vašu lozinku!");
    return(false)
    }
    if (Forma.mail.value=="")
    {
    alert("Unesite Vaš E-mail!");
    return(false)
    }
return(true);
}
window.addEventListener('load', () => {
    const forma = document.querySelector("#novi-zadatak-forma");
    const input = document.querySelector("#novi-zadatak-unos");
    const lista = document.querySelector("#zadaci");
    $.get(`/prikazitodo`,function(res)
    {
        console.log(res);
        if(res.error)//ajko je doslo do grekse error ce biti definisan
        {
           console.log(res.error)
        }
        else
        {
            prikaziProsecnoVreme()
            for(var todo of res.todo_lista)
            {
                dodajTodoUListu(todo.id,todo.tekst,todo.vreme_kreiranja,todo.vreme_kompletiranja)
            }
        }
    });
    forma.addEventListener('submit', (e) => {
        e.preventDefault();

        const tekst = input.value;
        if(tekst.trim()!='')
        {
            $.post('/dodajtodo',{tekst:tekst},function(res)
            {
                console.log(res);
                var trenutno_vreme=new Date();
                var trenutno_vreme_str=`${trenutno_vreme.getDate()}.${trenutno_vreme.getMonth()}.${trenutno_vreme.getFullYear()} ${trenutno_vreme.getHours()}:${trenutno_vreme.getMinutes()}`
                dodajTodoUListu(res.id,tekst,trenutno_vreme_str,null);
            });
        }


        
    });
    function dodajTodoUListu(id,tekst,vreme_dodavanja,vreme_kompletiranja)
    {
        const zadatak = document.createElement('div');
        zadatak.classList.add('zadatak');
        const tekst_zadataka = document.createElement('input');
        tekst_zadataka.classList.add('tekst');
        tekst_zadataka.type = 'text';
        tekst_zadataka.dataset.id=id;
        tekst_zadataka.value = tekst;
        tekst_zadataka.setAttribute('readonly', 'readonly');

        const kompletiranje_zadatka=document.createElement('span');
        kompletiranje_zadatka.classList.add('kompletiranje-zadatka');
        if(vreme_kompletiranja==null)
        {
            kompletiranje_zadatka.dataset.kompletiran=0;
            kompletiranje_zadatka.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>`;
        }
        else
        {
            kompletiranje_zadatka.dataset.kompletiran=1;
            tekst_zadataka.style.textDecoration='line-through'
            kompletiranje_zadatka.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>`;
        }


        zadatak.appendChild(kompletiranje_zadatka);
        
        const sadrzaj_zadataka = document.createElement('div');
        sadrzaj_zadataka.classList.add('sadrzaj');
        zadatak.appendChild(sadrzaj_zadataka);
        sadrzaj_zadataka.appendChild(tekst_zadataka);

        const vremena= document.createElement('span');
        vremena.classList.add('vremena');
        vremena.innerHTML=`${vreme_dodavanja}<br>`;
        if(vreme_kompletiranja!=null)
        {
            vremena.innerHTML+=vreme_kompletiranja
        }
        zadatak.appendChild(vremena);
        const zadatak_radnje = document.createElement('div');
        zadatak_radnje.classList.add('radnje');
        
        const izmena_zadatka = document.createElement('button');
        izmena_zadatka.classList.add('izmena');
        izmena_zadatka.innerText = 'Izmeni';

        const brisanje_zadatka = document.createElement('button');
        brisanje_zadatka.classList.add('obrisi');
        brisanje_zadatka.innerText = 'Obriši';

        zadatak_radnje.appendChild(izmena_zadatka);
        zadatak_radnje.appendChild(brisanje_zadatka);

        zadatak.appendChild(zadatak_radnje);

        lista.appendChild(zadatak);

        input.value = '';
        kompletiranje_zadatka.addEventListener('click',(e)=>
        {
            if(kompletiranje_zadatka.dataset.kompletiran==0)
            {
                kompletiranje_zadatka.dataset.kompletiran=1;
                kompletiranje_zadatka.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>`;
                tekst_zadataka.style.textDecoration='line-through'
                var trenutno_vreme=new Date();
                var trenutno_vreme_str=`${trenutno_vreme.getDate()}.${trenutno_vreme.getMonth()}.${trenutno_vreme.getFullYear()} ${trenutno_vreme.getHours()}:${trenutno_vreme.getMinutes()}`
                vremena.innerHTML+=trenutno_vreme_str;
                var id=tekst_zadataka.dataset.id;
                $.post(`/kompletirajtodo/${id}`,function(response)
                {
                   console.log(response.msg);
                });
                prikaziProsecnoVreme();
            }
        })
        izmena_zadatka.addEventListener('click', (e) => {
            if (izmena_zadatka.innerText.toLowerCase() == "izmeni") {
                izmena_zadatka.innerText = "Sačuvaj";
                tekst_zadataka.removeAttribute("readonly");
                tekst_zadataka.focus();
            } else {
                izmena_zadatka.innerText = "Izmeni";
                tekst_zadataka.setAttribute("readonly", "readonly");
                var tekst=tekst_zadataka.value;
                $.post(`/izmenitodo/${id}`,{tekst:tekst},function(response)
                {
                   console.log(response.msg);
                });
            }
        });

        brisanje_zadatka.addEventListener('click', (e) => {
            var id=tekst_zadataka.dataset.id;
            $.post(`/obrisitodo/${id}`,function(response)
            {
               console.log(response.msg);
            });
            prikaziProsecnoVreme();
            lista.removeChild(zadatak);
        });
    }
    function prikaziProsecnoVreme()
    {
        let element=document.querySelector('span.prosecno_vreme');
        $.get(`/prosecnovreme`,function(prosecno_vreme_poruka)
        {
            element.innerText=prosecno_vreme_poruka
      
        });
    }
});