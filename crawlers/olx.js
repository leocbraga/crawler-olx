const request = require('request');

const cheerio = require('cheerio');

const adapter = require('./../adapter/mongodb.adapter');

const baseUrl = 'https://df.olx.com.br/';

search(baseUrl + 'autos-e-pecas/carros-vans-e-utilitarios');

function search(url, page){

    let urlWithPage = url + (page ? ("?o=" + page) : "");

    request(urlWithPage, (erro, response, body) => {

        let $ = cheerio.load(body);

        const anuncios = $(".section_OLXad-list ul li a ");

        console.log("Anúncios encontrados: %s", anuncios.length);

        for(let i in anuncios){

            let anuncio = anuncios[i];

            $ = cheerio.load(anuncio);

            let objeto = {};
            
            objeto.id = getId($);

            objeto.title = getTitle($);

            objeto.price = getPrice($);

            objeto.urlDetail = getDetailPage($);

            if(objeto && objeto.id){

               adapter.getById(objeto.id)

                .then(anuncioFound => {

                    if(anuncioFound && anuncioFound.length > 0){

                        console.log("O anúncio %s foi encontrado. Atualizando", objeto.id);
                        
                        adapter.update(objeto, objeto.id);

                    } else {
                        
                        adapter.save(objeto);

                    }

                })

            }

        }

        let nextPage = getNextPage(body);

        let lastPage = getLastPage(body);

        if(page == lastPage){

            console.log("Aguardando para iniciar novamente");

            setTimeout(() => {}, 3600000);

            search(url);

        }

        if(nextPage && nextPage > 0){

            console.log("Buscando a próxima página: %s", nextPage);

            search(url, nextPage);

        }

    });

    function getId($){

        return $("a").attr("data-lurker_list_id");

    }

    function getTitle($){

        return $(".col-2 div h2").text().trim();

    }

    function getPrice($){

        let price = $(".col-3 .OLXad-list-price").text().trim();

        if(price){

            price = price.replace("R$", "");

            price = price.trim();

            price = price.replace(".", "");

            price = parseFloat(price);


        }

        return price;

    }

    function getLastPage(html){

        let $ = cheerio.load(html);

        let lastPage = $(".module_pagination ul li:last-child a").attr("href");

        let parts = lastPage.split("=");

        if(parts.length > 0){

            return parts[1];

        }

        return 0;

    }

    function getDetailPage($){

        return $("a").attr("href");

    }

    function getNextPage(html){

        let $ = cheerio.load(html);

        let lastPage = $(".next a").attr("href");

        let parts = lastPage.split("=");

        if(parts.length > 0){

            return parts[1];

        }

        return 0;


    }

}



