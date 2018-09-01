import request from 'supertest';
import { expect } from 'chai';

import app from './index';

describe('Url Error Handle', () => {
  let wrongUrl;
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