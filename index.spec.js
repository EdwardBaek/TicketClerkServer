import request from 'supertest';
import { expect } from 'chai';

import app from './index';
import async from 'async';

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


  const URL_TRANSFER = '/api/transfer/';
  describe(URL_TRANSFER, () => {

    describe('#POST' , () => {
      it('should respond 400 when it does not send a parameter', (done) => {
        const url = URL_TRANSFER;
        request(app)
          .post(url)
          .expect(400, done);
      });
      it('should respond 400 when it sends a wrong type of parameter', (done) => {
        const url = URL_TRANSFER;
        const parameter = {userId: 'a', ticketId: 'A'}
        request(app)
          .post(url)
          .send(parameter)
          .expect(400, done);
      });
      it('should respond 404 when it sends a wrong value of parameter', (done) => {
        const url = URL_TRANSFER;
        const parameter = {userId: 0, ticketId: 0}
        request(app)
          .post(url)
          .send(parameter)
          .expect(404, done);
      });
      it('should respond 201 with correct return values', (done) => {
        const urlGet = URL_TICKETS;
        request(app)
          .get(urlGet)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            const urlPost = URL_TRANSFER;
            const {ownerId, ticketId} = res.body.rows[0];
            const parameter = {userId: ownerId, ticketId};
            request(app)
              .post(urlPost)
              .send(parameter)
              .expect(201)
              .end((err, res) => {
                if (err) return done(err);
                
                const row = res.body.rows[0];
                expect(res.body.rows).not.to.have.lengthOf(0);
                expect(row).to.have.all.keys(
                  'id', 'ticketId', 
                  'fromUserId', 'fromUserName', 
                  'toUserId', 'toUserName', 
                  'allowance', 'regTime', 'transferTime'
                );
                expect(row).haveOwnProperty('id').to.be.a('number');
                expect(row).haveOwnProperty('ticketId').to.be.a('number');
                expect(row).haveOwnProperty('fromUserId').to.be.a('number');
                expect(row).haveOwnProperty('fromUserName').to.be.a('string');
                expect(row).haveOwnProperty('toUserId').to.be.a('null');
                expect(row).haveOwnProperty('toUserName').to.be.a('null');
                expect(row).haveOwnProperty('allowance').to.be.a('null');
                expect(row).haveOwnProperty('regTime').to.be.a('string');
                expect(row).haveOwnProperty('transferTime').to.be.a('null');

                done();
            });
          });
      });
    });

    describe('#GET' , () => {
      it('should return list', (done) => {
        const url = URL_TRANSFER;
        request(app)
          .get(url)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            const row = res.body.rows[0];
            expect(res.body.rows).not.to.have.lengthOf(0);
            expect(row).to.have.all.keys(
              'id', 'ticketId', 
              'fromUserId', 'fromUserName', 
              'toUserId', 'toUserName', 
              'allowance', 'regTime', 'transferTime'
            );
            
            done();
          });
      });
    });

    describe('#DELETE' , () => {
      it('should respond 200 with rowCount when there is the delete action', (done) => {
        const url = URL_TRANSFER;
        request(app)
          .delete(url)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            expect(res.body.rowCount).not.to.equal(0);
            done();
          });
      });
      it('should respond 200 with 0 rowCount when there is no delete', (done) => {
        const url = URL_TRANSFER;
        request(app)
          .delete(url)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            expect(res.body.rowCount).to.equal(0);
            done();
          })
      });
    });

    describe(':id #GET' , () => {
      it('should respond 400 when it sends wrong type of parameter', (done) => {
        const wrongTransferId = 's';
        const url = URL_TRANSFER + wrongTransferId;
        request(app)
          .get(url)
          .expect(400, done);
      });
      it('should respond 404 when it sends wrong value of parameter', (done) => {
        const wrongTransferId = 0;
        const url = URL_TRANSFER + wrongTransferId;
        request(app)
          .get(url)
          .expect(404, done);
      });
      it('should respond 200 with correct return values', (done) => {
        const urlGet = URL_TICKETS;
        request(app)
          .get(urlGet)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            const urlPost = URL_TRANSFER;
            const {ownerId, ticketId} = res.body.rows[0];
            const parameter = {userId: ownerId, ticketId};
            request(app)
              .post(urlPost)
              .send(parameter)
              .expect(201)
              .end((err, res) => {
                if (err) return done(err);

                const transferId = res.body.rows[0].id;
                const urlGetTransferDetail = URL_TRANSFER + transferId;
                request(app)
                  .get(urlGetTransferDetail)
                  .expect(200)
                  .end((err, res) => {
                    if (err) return done(err);

                    const row = res.body.rows[0];
                    expect(res.body.rows).not.to.have.lengthOf(0);
                    expect(row).to.have.all.keys(
                      'id', 'ticketId', 
                      'fromUserId', 'fromUserName', 
                      'toUserId', 'toUserName', 
                      'allowance', 'regTime', 'transferTime'
                    );
                    expect(row).haveOwnProperty('id').to.be.a('number');
                    expect(row).haveOwnProperty('ticketId').to.be.a('number');
                    expect(row).haveOwnProperty('fromUserId').to.be.a('number');
                    expect(row).haveOwnProperty('fromUserName').to.be.a('string');
                    expect(row).haveOwnProperty('toUserId').to.be.a('null');
                    expect(row).haveOwnProperty('toUserName').to.be.a('null');
                    expect(row).haveOwnProperty('allowance').to.be.a('null');
                    expect(row).haveOwnProperty('regTime').to.be.a('string');
                    expect(row).haveOwnProperty('transferTime').to.be.a('null');

                    done();
                  });
            });
          });
      });
    });

    describe('/apply #PUT' , () => {
      let transferInfo = {
        transferId: undefined,
        fromUserId: undefined,
        toUserId: undefined
      };

      beforeEach((done) => {
        transferInfo = {
          transferId: undefined,
          fromUserId: undefined,
          toUserId: undefined
        };
        async.series([
          function(callback) {
            const url = URL_TRANSFER;
            request(app)
              .get(url)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);

                const {id, fromUserId} = res.body.rows[0];
                transferInfo.transferId = id;
                transferInfo.fromUserId = fromUserId;
                callback(null);
              });
          },
          function(callback) {
            const url = '/api/users/';
            request(app)
              .get(url)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);

                const rows = Array.from(res.body.result.rows);
                transferInfo.toUserId = rows.filter((item, idx) => item.id !== transferInfo.fromUserId )[0].id;
                // console.log('transferInfo.toUserId', transferInfo.toUserId);
                callback(null);
              });
          },
        ], function (err, results) { done(); });
      });

      it('should respond 400 when it does not send parameter', (done) => {
        const url = URL_TRANSFER + 'apply';
        request(app)
          .put(url)
          .expect(400, done);
      });
      it('should respond 404 when it sends wrong type of parameter', (done) => {
        const url = URL_TRANSFER + 'apply';
        const parameterInvalidUserId = {
          transferId: transferInfo.transferId,
          toUserId: 'b'
        };
        const parameterInvalidTransferId = {
          transferId: 'a',
          toUserId: transferInfo.toUserId
        };
        const parameterInvalidUserIdAndTransferId = {
          transferId: 'a',
          toUserId: 'a'
        };
        function putRequestCheck(callback, parameter) {
          request(app)
            .put(url)
            .send(parameter)
            .expect(400, callback);
        }
        async.series([
          function(callback) {
            putRequestCheck(callback, parameterInvalidUserId);
          },  
          function(callback) {
            putRequestCheck(callback, parameterInvalidTransferId);
          },  
          function(callback) {
            putRequestCheck(callback, parameterInvalidUserIdAndTransferId);
          },  
        ], done);
        
      });
      it('should respond 409 when it sends invalid value of parameter', (done) => {
        const url = URL_TRANSFER + 'apply';
        const parameterInvalidUserId = {
          transferId: transferInfo.transferId,
          toUserId: 0
        };
        const parameterInvalidTransferId = {
          transferId: 0,
          toUserId: transferInfo.toUserId
        };
        const parameterInvalidUserIdAndTransferId = {
          transferId: 0,
          toUserId: 0
        };
        function putRequestCheck(callback, parameter) {
          request(app)
            .put(url)
            .send(parameter)
            .expect(409, callback);
        }
        async.series([
          function(callback) {
            putRequestCheck(callback, parameterInvalidUserId);
          },  
          function(callback) {
            putRequestCheck(callback, parameterInvalidTransferId);
          },  
          function(callback) {
            putRequestCheck(callback, parameterInvalidUserIdAndTransferId);
          },  
        ], done);
      });
      it('should respond 200 with correct return values', (done) => {
        const url = URL_TRANSFER + 'apply';
        const parameter = {
          transferId: transferInfo.transferId,
          toUserId: transferInfo.toUserId
        };
        request(app)
          .put(url)
          .send(parameter)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            const row = res.body.rows[0]; 
            expect(row).to.have.all.keys(
              'id', 'ticketId', 
              'fromUserId', 'fromUserName', 
              'toUserId', 'toUserName', 
              'allowance', 'regTime', 'transferTime'
            );
            expect(row).haveOwnProperty('id').to.be.a('number');
            expect(row).haveOwnProperty('ticketId').to.be.a('number');
            expect(row).haveOwnProperty('fromUserId').to.be.a('number');
            expect(row).haveOwnProperty('fromUserName').to.be.a('string');
            expect(row).haveOwnProperty('toUserId').to.be.a('number');
            expect(row).haveOwnProperty('toUserName').to.be.a('string');
            expect(row).haveOwnProperty('allowance').to.be.a('null');
            expect(row).haveOwnProperty('regTime').to.be.a('string');
            expect(row).haveOwnProperty('transferTime').to.be.a('null');
            
            done();
          });
      });
    });

    describe('/approval #PUT' , () => {
      let transferInfo = {
        transferId: undefined,
        fromUserId: undefined,
        toUserId: undefined
      };

      beforeEach((done) => {
        transferInfo = {
          transferId: undefined,
          fromUserId: undefined,
          toUserId: undefined
        };
        async.series([
          function(callback) {
            const url = URL_TRANSFER;
            request(app)
              .get(url)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);

                const {id, fromUserId} = res.body.rows[0];
                transferInfo.transferId = id;
                transferInfo.fromUserId = fromUserId;
                callback(null);
              });
          },
          function(callback) {
            const url = '/api/users/';
            request(app)
              .get(url)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);

                const rows = Array.from(res.body.result.rows);
                transferInfo.toUserId = rows.filter((item, idx) => item.id !== transferInfo.fromUserId )[0].id;
                // console.log('transferInfo.toUserId', transferInfo.toUserId);
                callback(null);
              });
          },
          function (callback) {
            const url = URL_TRANSFER + 'apply';
            const parameter = {
              transferId: transferInfo.transferId,
              toUserId: transferInfo.toUserId
            };
            request(app)
              .put(url)
              .send(parameter)
              .expect(200, callback);
          }
        ], function (err, results) { done(); });
      });

      it('should respond 400 when it does not send parameter', (done) => {
        const url = URL_TRANSFER + 'approval';
        request(app)
          .put(url)
          .expect(400, done);
      });
      it('should respond 400 when it sends wrong type of parameter', (done) => {
        const url = URL_TRANSFER + 'approval';
        const parameterInvalidTransferId = {
          transferId: 0,
          Allowance: true
        };
        const parameterInvalidAllowance = {
          transferId: transferInfo.transferId,
          Allowance: 0
        };
        const parameterInvalidTransferIdAndAllowance = {
          transferId: 'a',
          Allowance: 0
        };
        function putRequestCheck(callback, parameter) {
          request(app)
            .put(url)
            .send(parameter)
            .expect(400, callback);
        }
        async.series([
          function(callback) {
            putRequestCheck(callback, parameterInvalidTransferId);
          },  
          function(callback) {
            putRequestCheck(callback, parameterInvalidAllowance);
          },  
          function(callback) {
            putRequestCheck(callback, parameterInvalidTransferIdAndAllowance);
          },  
        ], done);
      });
      it('should respond 404 when it sends wrong value of parameter', (done) => {
        const url = URL_TRANSFER + 'approval';
        const parameterInvalidTransferId = {
          transferId: 0,
          allowance: true
        };
        request(app)
          .put(url)
          .send(parameterInvalidTransferId)
          .expect(404, done);
      });
      it('should respond 200 with correct return values when it sends allowance true', (done) => {
        const url = URL_TRANSFER + 'approval';
        const parameter = {
          transferId: transferInfo.transferId,
          allowance: true
        };
        request(app)
          .put(url)
          .send(parameter)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            expect(res.body.rows).to.have.lengthOf(1);
            const row = res.body.rows[0]; 
            expect(row).to.have.all.keys(
              'id', 'ticketId', 
              'fromUserId', 'fromUserName', 
              'toUserId', 'toUserName', 
              'allowance', 'regTime', 'transferTime'
            );
            expect(row).haveOwnProperty('id').to.be.a('number');
            expect(row).haveOwnProperty('ticketId').to.be.a('number');
            expect(row).haveOwnProperty('fromUserId').to.be.a('number');
            expect(row).haveOwnProperty('fromUserName').to.be.a('string');
            expect(row).haveOwnProperty('toUserId').to.be.a('number');
            expect(row).haveOwnProperty('toUserName').to.be.a('string');
            expect(row).haveOwnProperty('allowance').to.be.a('boolean');
            expect(row).haveOwnProperty('regTime').to.be.a('string');
            expect(row).haveOwnProperty('transferTime').to.be.a('string');

            done();
          });
      });
      it('should respond 200 with correct return values when it sends allowance false', (done) => {
        const url = URL_TRANSFER + 'approval';
        const parameter = {
          transferId: transferInfo.transferId,
          allowance: false
        };
        request(app)
          .put(url)
          .send(parameter)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);

            expect(res.body.rows).to.have.lengthOf(1);
            const row = res.body.rows[0]; 
            expect(row).to.have.all.keys(
              'id', 'ticketId', 
              'fromUserId', 'fromUserName', 
              'toUserId', 'toUserName', 
              'allowance', 'regTime', 'transferTime'
            );
            expect(row).haveOwnProperty('id').to.be.a('number');
            expect(row).haveOwnProperty('ticketId').to.be.a('number');
            expect(row).haveOwnProperty('fromUserId').to.be.a('number');
            expect(row).haveOwnProperty('fromUserName').to.be.a('string');
            expect(row).haveOwnProperty('toUserId').to.be.a('number');
            expect(row).haveOwnProperty('toUserName').to.be.a('string');
            expect(row).haveOwnProperty('allowance').to.be.a('boolean');
            expect(row).haveOwnProperty('regTime').to.be.a('string');
            expect(row).haveOwnProperty('transferTime').to.be.a('string');

            done();
          });
      });

    });

  });

});