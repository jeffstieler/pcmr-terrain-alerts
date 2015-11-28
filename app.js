var	request       = require( "request" ),
	cheerio       = require( "cheerio" ),
	Prowl         = require( "node-prowl" ),
	prowl         = new Prowl( process.env.PROWL_API_KEY || "" ),
	snowReportURL = "http://www.parkcitymountain.com/mountain/terrain-status.aspx",
	terrainAlerts = [ "Pinecone Lower", "Pinecone Upper", "Pioneer Ridge" ];

function checkBowlStatus( err, response, html ) {

	if ( err ) {
		return console.error( err );
	}

	var	$ = cheerio.load( html ),
		trailStatus = {};

	$( "#TerrainStatus table.tableData tr" ).each( function( i, tableRow ) {

		var tableCells = $( "td", tableRow );

		if ( 3 !== tableCells.length ) {
			return;
		}

		var trailName = tableCells.eq( 1 ).text().trim();
		var isOpen    = tableCells.eq( 2 ).hasClass( "yesStatus" );

		trailStatus[ trailName ] = isOpen;

	} );

	terrainAlerts.forEach( function( trail ) {

		trailStatus[ trail ] && sendTerrainAlert( trail );

	} );

}

function sendTerrainAlert(terrain) {

	var message = terrain + " is open! " + terrain + " is open! " + terrain + " is open!";

	prowl.push(
		message,
		"PCMR",
		{
	    	priority: 2
		},
		function( err, remaining ) {
	    	if ( err ) {
	    		console.log( err );
	    	} else {
		    	console.log( "Message sent. " + remaining + " API calls remaining this hour." );
		    }
		}
	);

}

request( snowReportURL, checkBowlStatus );

