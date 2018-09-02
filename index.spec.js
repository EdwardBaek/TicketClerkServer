import request from 'supertest';
import { expect } from 'chai';

import app from './index';

const endFn = function endFn (err, res, done, callback) {
  if (err) {
    done(err);
    return;
  }
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
          if (err) {
            done(err); return;
          }
          const row = res.body.result.rows[0];
          expect(row).to.have.all.keys('id', 'name', 'password');
          expect(row).has.property('id').with.a('number');
          expect(row).has.property('name').with.a('string');
          expect(row).has.property('password').with.a('string');

          done();
        });
    });
  });
});