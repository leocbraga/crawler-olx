const mongoose = require('mongoose');

const { promisify } = require('util');

const url = 'mongodb://127.0.0.1/olx';

let db = getConnection(url);

const olxSchema = mongoose.Schema({
    id: String,
    title: String,
    price: Number,
    urlDetail: String,
    updatedAt: Date
});

var OlxSchema = mongoose.model('anuncios', olxSchema);

function getConnection(url){

    mongoose.connect(url, { useNewUrlParser: true });

    let db = mongoose.connection;

    db.on('error', (erro) => {

        console.error(erro);

        throw erro;

    });

}

module.exports = {

    getById: (id) => {

        let promise = new Promise((resolve, reject) => {

            OlxSchema.find({"id": id}, (erro, registros) => {

                if(erro){

                    reject(erro);

                } else {

                    resolve(registros);

                }

            })

        });

        return promise;

    },

    save: (anuncio) => {

        anuncio.updatedAt = new Date();

        let anuncioSchema = new OlxSchema(anuncio);

        return anuncioSchema.save();

    },

    update: (anuncio, id) => {

        anuncio.updatedAt = new Date();

        let anuncioSchema = new OlxSchema(anuncio);

        return OlxSchema.update({"id": id}, anuncioSchema);

    }

}

  
  