import request from 'supertest';
import { expect } from 'chai';

import app from './index';

const endFn = function endFn (err, res, done, callback) {
  if (err) return done(err);
  if (typeof callback === 'function') {
    callback();
  }
  done();
};

describe('Url Error Handle', () => {
  let wrongUrl;
  
  beforeEach( ()=> {
    wrongUrl = '/so-wrong-url';
  });

  describe('wrong url', () => {
    it('should respond with 404', (done) => {
      request(app)
        .get(wrongUrl)
        .expect(404)
        .end((err, res) => endFn(err, res, done, false));
    });

    it('should respond with error message "Not Found"', (done) => {
      request(app)
        .get(wrongUrl)
        .end((err, res) => endFn(err, res, done, () => {
          const jsonResult = JSON.parse(res.text);
          expect(jsonResult.error.message).to.equal('Not Found');
        }))
    });

  });
});

const testUserId = 1;
const testWrongUserId = 0;
describe('API TEST', () => {
  describe('/api/users/', () => {
    const url = '/api/users/';
    it('#GET should respond with 200', (done) => {
      request(app)
        .get(url)
        .expect(200)
        .end(done);
    });
    it('#GET should respond with correct return values', (done) => {
      request(app)
        .get(url)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          const row = res.body.result.rows[0];
          expect(row).to.have.all.keys('id', 'name', 'password');
          expect(row).has.property('id').with.a('number');
          expect(row).has.property('name').with.a('string');
          expect(row).has.property('password').with.a('string');

          done();
        });
    });
  });

  const URL_TICKETS = '/api/tickets/';
  const TICKET_ID_WRONG_NUMBER = 0;
  const TICKET_ID_WRONG_TYPE = 'A';

  describe(URL_TICKETS , () => {
    let parameter;

    beforeEach(()=> {
      parameter = undefined;
    });

    describe('#POST', () => {
      it('should respond 400 without a parameter', (done) => {
        request(app)
        .post(URL_TICKETS)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.be.empty;
          done();
        })
      });
      it('should respond 400 with a wrong type of parameter', (done) => {
        parameter = {userId: 'testWrongUserId'};
        request(app)
          .post(URL_TICKETS)
          // .set('Content-Type', 'application/json')
          .send(parameter)
          .expect(400, done)
      });
      it('should respond 404 with a wrong user id of parameter', (done) => {
        parameter = {userId: testWrongUserId};
        request(app)
          .post(URL_TICKETS)
          // .set('Content-Type', 'application/json')
          .send(parameter)
          .expect(404, done)
      });
      it('should respond 201 with correct return values', (done) => {
        parameter = {userId :testUserId};
        request(app)
          .post(URL_TICKETS)
          .send(parameter)
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
  
            const row = res.body.rows[0];
            expect(res.body).not.to.be.empty;
            expect(row).to.have.all.keys('ticketId', 'userId', 'userName', 'issueTime');
            expect(row).has.property('ticketId').with.a('number');
            expect(row).has.property('userId').with.a('number');
            expect(row).has.property('userName').with.a('string');
            expect(row).has.property('issueTime').with.a('string');
  
            done();
          });
      });
    });

    describe('#GET', () => {
      it('should have a list', (done) => {
        request(app)
          .get(URL_TICKETS)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            
            const row = res.body.rows[0];
            expect(res.body.rows).not.to.empty;
            expect(row).to.have.all.keys('ticketId', 'ownerId', 'userName', 'issueTime');
            expect(row).to.haveOwnProperty('ticketId').to.be.a('number');
            expect(row).to.haveOwnProperty('ownerId').to.be.a('number');
            expect(row).to.haveOwnProperty('userName').to.be.a('string');
            expect(row).to.haveOwnProperty('issueTime').to.be.a('string');
            done();
          })
      });
    });

    describe('#DELETE', () => {
      it('should have return count with delete', (done) => {
        parameter = {userId :testUserId};
        request(app)
          .post(URL_TICKETS)
          .send(parameter)
          .end((err, res) => {
            if (err) return done(err);
  
            request(app)
              .delete(URL_TICKETS)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
      
                expect(res.body.rowCount).not.to.equal(0);
                done();
              });
          });
      });
      it('should have return count without delete', (done) => {
        request(app)
          .delete(URL_TICKETS)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
  
            expect(res.body.rowCount).to.equal(0);
            done();
          });
      });

    });

    describe(':ticketId #GET', () => {
      it('should have return 400 with a wrong type of parameter', (done) => {
        const url = URL_TICKETS + TICKET_ID_WRONG_TYPE;
        request(app)
          .get(url)
          .expect(400, done)
      });
      it('should have return 404 with a wrong value of parameter', (done) => {
        const url = URL_TICKETS + TICKET_ID_WRONG_NUMBER;
        request(app)
          .get(url)
          .expect(404, done)
      });
      it('should have return values', (done) => {
        parameter = {userId :testUserId};
        request(app)
          .post(URL_TICKETS)
          .send(parameter)
          .end((err, res) => {
            if (err) return done(err);
  
            const newTicketId = res.body.rows[0].ticketId;
            // console.log('newTicketId', newTicketId);

            const url = URL_TICKETS + newTicketId;
            request(app)
              .get(url)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
      
                const row = res.body.rows[0];
                expect(res.body.rows).not.to.empty;
                expect(row).to.have.all.keys('ticketId', 'ownerId', 'userName', 'issueTime');
                expect(row).to.haveOwnProperty('ticketId').to.be.a('number');
                expect(row).to.haveOwnProperty('ownerId').to.be.a('number');
                expect(row).to.haveOwnProperty('userName').to.be.a('string');
                expect(row).to.haveOwnProperty('issueTime').to.be.a('string');
                done();
              });
          });
      });
    });

    describe(':ticketId #DELETE', () => {
      it('should respond 400 with a wrong type parameter', (done) => {
        const url = URL_TICKETS + TICKET_ID_WRONG_TYPE;
        request(app)
          .delete(url)
          .expect(400, done)
      });
      it('should have return values', (done) => {
        parameter = {userId :testUserId};
        request(app)
          .post(URL_TICKETS)
          .send(parameter)
          .end((err, res) => {
            if (err) return done(err);
  
            const newTicketId = res.body.rows[0].ticketId;
            // console.log('newTicketId', newTicketId);

            const url = URL_TICKETS + newTicketId;
            request(app)
              .delete(url)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
      
                const row = res.body.rows[0];
                expect(res.body.rows).not.to.empty;
                expect(row).to.have.all.keys('ticketId', 'userId', 'userName', 'issueTime');
                expect(row).to.haveOwnProperty('ticketId').to.be.a('number');
                expect(row).to.haveOwnProperty('userId').to.be.a('number');
                expect(row).to.haveOwnProperty('userName').to.be.a('string');
                expect(row).to.haveOwnProperty('issueTime').to.be.a('string');
                done();
              });
            });
      });
    });

  });

});