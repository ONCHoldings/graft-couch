var should = require('should');
var request = require('request');
var utils = require('./utils');
var Couch = require('../lib/couch.js');
var testPort = 12500;
var dbName = 'ws_mocks';
var dbConfig = {pathname: dbName};
var serverConfig = {db: dbName, port: testPort};
var newId = '';

var Graft = require('graftjs/server');
require('graftjs/middleware/REST.graft.js');
require('../middleware/CouchDB.graft.js');
Graft.load(__dirname);
Graft.start(serverConfig);


function cleanup(done) {
    this.dbDel(function(err) {
        done();
    });
}

// Install and destroy database.
// -----------------------------
describe('install', function() {
    var db = new Couch(dbConfig);

    before(cleanup.bind(db));
    after(cleanup.bind(db));

    it('should install the database', function(done) {
    	utils.install(dbConfig, done);
    });

    it('check that database exists', function(done) {
        db.get('_design/backbone', function(err, doc) {
            if (err) throw err;
            should.ok(doc._rev);
            should.ok(doc.language);
            should.ok(doc.views);
            should.ok(doc.rewrites);
            done();
        });
    });

    it('should delete the database', function(done) {
        db.dbDel(done);
    });

    it('check that database does not exist anymore', function(done) {
        db.get('_design/backbone', function(err, doc) {
            should.deepEqual(err.error, 'not_found');
            done();
        });
    });

});

describe('Reading model', function() {
		var db = new Couch(dbConfig);

	    before(cleanup.bind(db));
	    after(cleanup.bind(db));

	describe('Install DB', function() {

	    it('should install the database', function(done) {
	    	utils.install(dbConfig, done);
	    });
	});

	describe('POST /api/Mock', function() {
		var doc = {
			"id": 'one',
			"someVal": "Ronald McDonald",
            "favColor": "yello"
		};
		before(utils.requestUrl(testPort, '/api/Mock', 'POST', doc));

		// This is for the new location the server told us to go.
        var newLocation = '';
        it ('should have a location', function() {
            this.resp.should.have.header('Location');
        });

        it ('should return status 303', function() {
            this.resp.should.have.status(303);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });
	});

	describe('GET /api/Mock/one', function() {
		before(utils.requestUrl(testPort, '/api/Mock/one'));

		it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });

        it('should have the correct id', function() {
            this.body.should.have.property('id', 'one');
        });

        it('should have the correct someVal', function() {
            this.body.should.have.property('someVal', 'Ronald McDonald');
        });

        it ('should respect the default values', function() {
            this.body.should.have.property('name', 'name');
        });
	});

});

describe('Updating model', function() {
	var db = new Couch(dbConfig);
    before(cleanup.bind(db));
    after(cleanup.bind(db));

	describe('Install DB', function() {

	    it('should install the database', function(done) {
	    	utils.install(dbConfig, done);
	    });
	});

	describe('POST /api/Mock', function() {
		var doc = {
			"id": 'one',
			"someVal": "Ronald McDonald",
            "favColor": "yello"
		};
		before(utils.requestUrl(testPort, '/api/Mock', 'POST', doc));

		// This is for the new location the server told us to go.
        it ('should have a location', function() {
            this.resp.should.have.header('Location');
        });

        it ('should return status 303', function() {
            this.resp.should.have.status(303);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });
	});

	describe('GET /api/Mock/one', function() {
		before(utils.requestUrl(testPort, '/api/Mock/one'));

		it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });

        it('should have the correct id', function() {
            this.body.should.have.property('id', 'one');
        });

        it('should have the correct someVal', function() {
            this.body.should.have.property('someVal', 'Ronald McDonald');
        });

        it ('should respect the default values', function() {
            this.body.should.have.property('name', 'name');
        });
	});

	describe('PUT /api/Mock/one', function() {
	    var data = {
	    	id: "one",
	        someVal: "Emily Mortimer",
	        favColor: "magenta"
	    }
	    before(utils.requestUrl(testPort, '/api/Mock/one', 'PUT', data));

	    it ('should return status 201', function() {
	        this.resp.should.have.status(201);
	    });

	    it('response should be json', function() {
	        this.resp.should.be.json;
	    });

	    it ('should have a body', function() {
	        should.exist(this.body);
	    });

	    it ('should return the changed object', function() {
	        this.body.should.have.property('someVal', 'Emily Mortimer');
	    });

	    it ('should have added a field', function() {
	        this.body.should.have.property('favColor', 'magenta');
	    });
	});

    describe('GET /api/Mock/one', function() {
        before(utils.requestUrl(testPort, '/api/Mock/one'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });

        it ('should have added a field', function() {
            this.body.should.have.property('favColor', 'magenta');
        });

        it ('should return the changed object', function() {
            this.body.should.have.property('someVal', 'Emily Mortimer');
        });
    });
    describe('GET /api/Mock', function() {
        before(utils.requestUrl(testPort, '/api/Mock'));
        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });
        
        it ('should have added a field', function() {
            this.body[0].should.have.property('favColor', 'magenta');
        });


        it ('should return the changed object in listing', function() {
            this.body[0].should.have.property('someVal', 'Emily Mortimer');
        });
    });
});

//get collection
// describe('POST /api/Mock', function() {
// 	var doc = {
// 		"id": 'two',
// 		"someVal": "Some text",
//         "favColor": "red"
// 	};
// 	before(utils.requestUrl(testPort, '/api/Mock', 'POST', doc));

// 	// This is for the new location the server told us to go.
//     it ('should have a location', function() {
//         this.resp.should.have.header('Location');
//     });

//     it ('should return status 303', function() {
//         this.resp.should.have.status(303);
//     });

//     it('response should be json', function() {
//         this.resp.should.be.json;
//     });

//     it ('should have a body', function() {
//         should.exist(this.body);
//     });
// });

// describe('GET /api/Mock/two', function() {
// 		before(utils.requestUrl(testPort, '/api/Mock/two'));

// 		it ('should return status 200', function() {
//             this.resp.should.have.status(200);
//         });

//         it('response should be json', function() {
//             this.resp.should.be.json;
//         });

//         it ('should have a body', function() {
//             should.exist(this.body);
//         });

//         it('should have the correct id', function() {
//             this.body.should.have.property('id', 'two');
//         });

//         it('should have the correct someVal', function() {
//             this.body.should.have.property('someVal', 'Some text');
//         });

//         it ('should respect the default values', function() {
//             this.body.should.have.property('name', 'name');
//         });
// 	});

// describe('Delete model', function() {

// 	describe('Install DB', function() {
// 		var db = new Couch(dbConfig);

// 	    before(cleanup.bind(db));

// 	    it('should install the database', function(done) {
// 	    	utils.install(dbConfig, done);
// 	    });
// 	});

// 	describe('POST /api/Mock', function() {
// 		var doc = {
// 			"id": 'one',
// 			"someVal": "Ronald McDonald", // was "Emily Baker"
//             "favColor": "yello" // new field
// 		};
// 		before(utils.requestUrl(testPort, '/api/Mock', 'POST', doc));

// 		// This is for the new location the server told us to go.
//         var newLocation = '';
//         it ('should have a location', function() {
//             this.resp.should.have.header('Location');
//         });

//         it ('should return status 303', function() {
//             this.resp.should.have.status(303);
//         });

//         it('response should be json', function() {
//             this.resp.should.be.json;
//         });

//         it ('should have a body', function() {
//             should.exist(this.body);
//         });
// 	});

// 	describe('DELETE /api/Mock/one', function() {
// 		before(utils.requestUrl(testPort, '/api/Mock/one', 'DELETE'));

// 	    it ('should return status 204', function() {
// 	        this.resp.should.have.status(204);
// 	    });

// 	    describe('GET /api/Mock/one', function() {
// 	        before(utils.requestUrl(testPort, '/api/Account/1'));
// 	        it ('should return status 404', function() {
// 	            this.resp.should.have.status(404);
// 	        });
// 	    });

// 	    // describe('GET /api/Mock', function() {
// 	    //     before(utils.requestUrl(testPort, '/api/Mock'));
// 	    //     it ('should return status 200', function() {
// 	    //         this.resp.should.have.status(200);
// 	    //     });

// 	    //     it('response should be json', function() {
// 	    //         this.resp.should.be.json;
// 	    //     });

// 	    //     it ('should have a body', function() {
// 	    //         should.exist(this.body);
// 	    //     });
	        
// 	    //     it ('should only be 6 in length', function() {
// 	    //         this.body.should.have.length(6);
// 	    //     });

// 	    //     it ('should not have a record with id 1', function() {
// 	    //         var record = _(this.body).findWhere({id: '1'});
// 	    //         if (record) {
// 	    //             should.fail(record, undefined, 'Should have been deleted');
// 	    //         }
// 	    //     });
// 	    // });
// 	});

// 	describe('destroy DB', function() {
// 		var db = new Couch(dbConfig);

// 	    it('should delete the database', function(done) {
// 	        db.dbDel(done);
// 	    });
// 	});
// });