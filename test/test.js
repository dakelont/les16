const Pokemon = require('../index.js').Pokemon;
const Pokemonlist = require('../index.js').Pokemonlist;
const assert = require('chai').assert;
const should = require('chai').should();
const expect = require('chai').expect;
require('mocha-sinon');
const sepertest = require('supertest');

describe('Класс Pokemon метод show()', function () {
    beforeEach(function() {
        let log = console.log;
        this.sinon.stub(console, 'log').callsFake(function() {
            return log.apply(log, arguments);
        });
    });

    it('выводит в консоль "name" и "level"', () => {
        let res = new Pokemon("Pokem", 1).show();
        expect(console.log.calledWith('Hi! My name is Pokem, my level is 1')).to.be.true;
    });

    it('выводит в консоль "name"', () => {
        let res = new Pokemon("Pokem").show();
        expect(console.log.calledWith('Hi! My name is Pokem, my level is undefined')).to.be.true;
    });
    
    it('выводит в консоль "level"', () => {
        let res = new Pokemon("", 1).show();
        expect(console.log.calledWith('Hi! My name is , my level is 1')).to.be.true;
    });
    
    it('выводит в консоль undefined при отсутствии "name" и "level"', () => {
        let res = new Pokemon().show();
        expect(console.log.calledWith('Hi! My name is undefined, my level is undefined')).to.be.true;
    });

    it('выводит в консоль "name" и "level" и игнорирует следущие параметры', () => {
        let res = new Pokemon("Pokem", 1, "T").show();
        expect(console.log.calledWith('Hi! My name is Pokem, my level is 1')).to.be.true;
    });

});
describe('Класс Pokemonlist', function () {
    let list;
    
    beforeEach(function() {
        list = new Pokemonlist(new Pokemon("Item0", 0), new Pokemon("Item1", 1));

        let log = console.log;
        this.sinon.stub(console, 'log').callsFake(function() {
            return log.apply(log, arguments);
        });
    });
    
    describe('метод add()', function () {
        it('добавление покемона c "name" и "level"', () => {
            list.add("Item2", 2);
            assert(list[2] !== undefined,'Покемон не добавлен');
        });
        it('добавление покемона c "name" без "level"', () => {
            list.add("Item2");
            assert(list[2] !== undefined,'Покемон не добавлен');
        });
        it('добавление покемона без "name" с "level"', () => {
            list.add("", 2);
            assert(list[2] !== undefined,'Покемон не добавлен');
        });

    })
    describe('метод show()', function () {
        it("показ одного покемона", () => {
            list = new Pokemonlist (new Pokemon("Item2", 2));
            list.show();
            expect(console.log.calledWith('Hi! My name is Item2, my level is 2')).to.be.true;
            expect(console.log.calledWith('There are 1 pokemons here.')).to.be.true;
        });

        it("показ нескольких покеномов", () => {
            list.show();
            expect(console.log.calledWith('Hi! My name is Item0, my level is 0')).to.be.true;
            expect(console.log.calledWith('Hi! My name is Item1, my level is 1')).to.be.true;
            expect(console.log.calledWith('There are 2 pokemons here.')).to.be.true;
        });
    })
    describe('метод max()', function () {
        it("покемон с максимальным уровнем", () => {
            expect(list.max().name == "Item1" && list.max().level == 1).to.be.true;
        });

        it("undefined, если список покемонов пуст", () => {
            list = new Pokemonlist ();
            expect(list.max()).to.be.undefined;
        });
    })
});

describe('REST API', () => {
    let server;

    before((done) => {
        require('../app/index-rest.js');
        setTimeout(() => {
            server = sepertest.agent('http://localhost:3001');
            done();
        }, 500);
    });

    it('GET /users/', done => {
        server
            .get('/users')
            .expect(200)
            .end ((err, res) => {
               expect(res.text).to.equal('<form action="/users/add/" method="post" name="user"><input type="text" name="name"><input type="text" name="score"><input type="submit"></form>');
               done();
            });
    });
    it("POST /users/add/",done => {
        server
            .post('/users/add/')
            .send({name : 'Test', score : '1'})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                expect(res.text).to.equal('user name - "Test"; score - "1"<br>,<form action="/users/add/" method="post" name="user"><input type="text" name="name"><input type="text" name="score"><input type="submit"></form>');
                done();
        });
    });
    it("delete /users/delete/:id",done => {
        server
            .post('/users/add/')
            .send({name : 'Test', score : '1'})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                server
                    .delete('/users/delete/Test')
                    .expect(200)
                    .end(function(err,res){
                        expect(res.text).to.equal('Пользователь Test удален,Пользователь Test удален,<form action="/users/add/" method="post" name="user"><input type="text" name="name"><input type="text" name="score"><input type="submit"></form>');
                        done();
                });
    
    
        });
    });

});