var serviceURL = "http://nikitdesigneroutlet.com/webservices/";
var imgSmall =  "http://nikitdesigneroutlet.com/images/Products/Small/";
var imgThumb = "http://nikitdesigneroutlet.com/images/Products/Thumb/";
var imgLarge =  "http://nikitdesigneroutlet.com/images/Products/Large/";
var webURL =  "http://nikitdesigneroutlet.com/";

var products;
var detailpage;
var fbkemail;

//helper function - random string
 function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

    var rString = randomString(24, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
//sqlite var here ...
var createStatement = "CREATE TABLE IF NOT EXISTS NikitCart1 (ldbid INTEGER PRIMARY KEY AUTOINCREMENT, ldbproductid INTEGER, ldbproductname TEXT, ldbproductdesc TEXT,  ldbprice TEXT, ldbimage TEXT)";
var selectAllStatement = "SELECT * FROM NikitCart1 ORDER BY ldbid DESC";
var insertStatement = "INSERT INTO NikitCart1 (ldbproductid, ldbproductname, ldbproductdesc, ldbprice, ldbimage) VALUES (?, ?, ?, ?, ?)";
var db = openDatabase("NikitLocal2", "1.0", "Nikit Local", 200000);  // Open SQLite Database

$(document).ready(function() {
   console.log('create cart db here');
   

});



$( document ).on( "pagecreate", "#nikit_home", function ( event ) {
    topproducts();
    popularproducts();
    topwomenproducts();
    topmenproducts();
    topkidsproducts();
    topjewelleryproducts();
});

$( document ).on( "pagebeforechange", "#nikit_home", function ( event ) {
    topproducts();
    popularproducts();
    topwomenproducts();
    topmenproducts();
    topkidsproducts();
    topjewelleryproducts();
});

$( document ).on( "pagecreate", "#nikit_category", function ( event ) {
    productsbycategory();
});

$(document).on( "pagecreate", "#nikit_cart", function ( event ) {
    
    var cartTotal = 0;
    db.transaction(function (tx) {
     tx.executeSql(selectAllStatement, [], function (tx, result) {
     var dataset = result.rows;
     console.log(dataset);
    for (var i = 0, item = null; i < dataset.length; i++) {
    item = dataset.item(i);
    cartTotal += parseInt(item.ldbprice);

    console.log(item['ldbproductname']);
    var cartInfo = '<li><img src="'+item['ldbimage']+'"><h4>' + item['ldbproductname'] +'</h4><!--<p>Qty: 1</p>--><p>N '+item['ldbprice']+'</p></li>';
    $("#cartList").append(cartInfo);

            }

    $("#cartList").append('<li style="font-weight: bold;"><h2>Total: N '+cartTotal+'.OO</h2></li>');
    $("#cartTotal").text('(N'+cartTotal+')');
 
        });
 
    });
});

$(document).on( "pagecreate", "#nikit_checkout", function ( event ) {
    console.log('got it');
    var et = $.getJSON('js/countries.json', function(data) {
        console.log(data);
        var countries = data;
        console.log(countries);
        for (var i = 0; i < data.length; i++) {
            var country = countries[i];
            console.log(country.name);
            $("#memCountry").append('<option value="'+country.cca2+'">'+country.name.common+'</option>');
        };
    });
    et.fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });

// insert members
    $('#submitMem').on('click', function(event) {
        event.preventDefault();
        
        var submitJQM = $.ajax({  
            //regmembers - registers members and the order.
  url: (serviceURL + 'regmembers.php'),
  type: "GET",  
  data: {
      firstname: $('#memFirstname').val(),
      lastname: $('#memLastName').val(),
      country: $('#memCountry').val(),
      address: $('#memAddress1').val(),
      city: $('#memCity').val(),
      phone: $('#memContactPhone').val()
        },
   datatype:"json"
   
    });
        submitJQM.fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });

        var jsonordercode = 1;//last inserted id in order with if statement
       // if (jsonordercode) {
        //insert orders
            //first get orders in cart
            db.transaction(function (tx) {
     tx.executeSql(selectAllStatement, [], function (tx, result) {
     var dataset = result.rows;
     console.log(dataset);
     var item = null;
    for (var i = 0, item = null; i < dataset.length; i++) {
    item = dataset.item(i);
    console.log('ids here: '+item.ldbproductid);
    //insert orders one by one
        var insertJQM = $.ajax({  
  url: (serviceURL + 'addorders.php'),
  type: "GET",  
  data: {
      orderid: jsonordercode,
      productid: item.ldbproductid,
      productname: item.ldbproductname,
      price: item.ldbprice

        },
   datatype:"json",
   success: function(data){
    console.log('worked '+data);
   }
   
    });


       }
    });

    });
        //}//end if


    
    });

});

$( document ).on( "pagebeforeshow", "#nikit_productdetail", function ( event ) {
    
    //create table here;
   
    createTable();

    var pid = getUrlVars()["pid"];
    $.getJSON(serviceURL+'getproductdetail.php?pid='+pid, function(data) {

 var productdetails = data;
    var productdetail = productdetails[0];
    console.log(productdetail.ProductName);
    
    $('.productTitle').text(productdetail.ProductName);
    $('.productDesc').html(productdetail.ProductDescription);
    $('.productPrice').text('N '+productdetail.prPrice);
    $('.productLarge').attr('src', imgLarge+ productdetail.picFileName);


    //click event
    $('#addtocartBtn').on('click', function(event) {
        event.preventDefault();
    //ldbid, ldbproductname, ldbprice, ldbimage
    //db here

    var ldb_productid = productdetail.ProductID;
    var ldb_productname = productdetail.ProductName;
    var ldb_productdesc = productdetail.ProductDescription;
    var ldb_price = productdetail.prPrice;
    var ldb_image = imgSmall + productdetail.picFileName;
    //var p_sqlite_date = 'date';//currentDate
    db.transaction(function (tx) { tx.executeSql(insertStatement, [ldb_productid, ldb_productname, ldb_productdesc, ldb_price, ldb_image], savedToFav(ldb_productname), onError); });
 

});

});

});

function createTable()  // Function for Create Table in SQLite.
{
  db.transaction(function (tx) { tx.executeSql(createStatement, [], showRecords, onError); });
}

function showRecords(){}

function onError(tx, error) // Function for Hendeling Error...
{   alert(error.message);}

function insertRecord() // Get value from Input and insert record . Function Call when Save/Submit Button Click..
{
    var pub_title = $('.articleDetail_title').text();
    var pub_message = $('.articleDetail_title').text() +' <p>'+ $('.articleDetail_content').html(); 
    var pub_link = $('.articleDetail_link').find('a').attr('href');
    
        var p_sqlite_title = $('.articleDetail_title').text();
        var p_sqlite_desc = $('.articleDetail_content').html();
        var p_sqlite_link = $('.articleDetail_link').find('a').attr('href');
        var p_sqlite_date = 'date';//currentDate
        db.transaction(function (tx) { tx.executeSql(insertStatement, [p_sqlite_title, p_sqlite_desc, p_sqlite_link, p_sqlite_date], savedToFav, onError); });
 }

 function savedToFav(ldb_productname){
    var msg = ldb_productname+' has been added to your cart. ';
    console.log(msg);
    //var addedPopUp = '<div id="" data-role="popup">'+msg+'</div> ';
    $('#addcartmsg').append(msg)
   // msg.append($( '#addToCartPopUp' ).appendTo( $.mobile.activePage ).popup());
   //$('#addToCartPopUp').appendTo($.mobile.activePage);
   $('#addToCartPopUp').popup()
    $('#addToCartPopUp').popup('open');
    //console.log(addedPopUp);
   

 }

function topproducts() {
	
	var jw = $.getJSON(serviceURL + 'getalltopdeals.php?count='+7, function(data) {
        console.log(arguments);
		//$('#home_featured').empty();
        console.log('j');
        var content ='';
		for(var i in data){
       
       var img = data[i].picFileName;
       var pname = data[i].ProductName;
       var pprice = data[i].prPrice;
       var pid = data[i].ProductID;
				
                content += '<div class="product_wrap">'+
				'<a  data-transition="slide"  href="productdetail.html?pid='+pid+'">'+
					'<div class="imgwrapper"><img src="'+imgThumb+img+'"/></div>'+
					'<div class="info"><h4>'+pname+'</h4>'+
					'<p>N '+pprice+'</p><span class="btn">Buy</span></div>'+
				'</a>'+
			'</div>';
            
            }
        $(content).appendTo('#home_featured');

        $('#home_featured').slick({
                slidesToShow: 4,
                slidesToScroll: 1,infinite:true,  autoplay: true,
  autoplaySpeed: 2000,
                responsive: [
                    {
                        breakpoint:800,
                        settings:{
                            slidesToShow: 4,
                            slidesToScroll: 1,infinite:true, autoplay: true,
  autoplaySpeed: 2000
                        }
                    },
                    {
                        breakpoint:640,
                        settings:{
                            slidesToShow:3,
                            slidesToScroll: 1,infinite:true, autoplay: true,
  autoplaySpeed: 2000
                        }
                    },
                    {
                        breakpoint:480,
                        settings:{
                            slidesToShow:2,
                            slidesToScroll: 1,infinite:true, autoplay: true,
  autoplaySpeed: 2000
                        }
                    },
                    {
                        breakpoint:320,
                        settings:{
                            slidesToShow:1,
                            slidesToScroll: 1,infinite:true
                        }
                    }

                ]
            });
		});
    jw.done(function() {
    console.log( "second successtop" );
    $('.LoadingProducts1').attr('style', 'display:none');
  });
  jw.fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });
  jw.always(function() {
    console.log( "completetop" );
  });
    

		
	}  
	

function popularproducts() {
	
	var jw = $.getJSON(serviceURL + 'getallpopulardeals.php?count='+7, function(data) {
		$('#home_popular').empty();
		products = data;
		$.each(products, function(index, product) {
            var pid = product.ProductID;

			$('#home_popular').append(''+
				'<div class="product_wrap">'+
				'<a data-ajax="false" data-transition="slide"  href="productdetail.html?pid='+pid+'">'+
					'<div class="imgwrapper"><img src="'+imgThumb+product.picFileName+'"/></div>'+
					'<div class="info"><h4>'+product.ProductName+'</h4>'+
					'<p>N '+product.prPrice+'</p><span class="btn">Buy</span></div>'+
				'</a>'+
			'</div>'
            );
		});

        $('#home_popular').slick({
                slidesToShow: 4,
                slidesToScroll: 1,infinite:true,
                responsive: [
                    {
                        breakpoint:800,
                        settings:{
                            slidesToShow: 4,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:640,
                        settings:{
                            slidesToShow:3,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:480,
                        settings:{
                            slidesToShow:2,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:320,
                        settings:{
                            slidesToShow:1,
                            slidesToScroll: 1,infinite:true
                        }
                    }

                ]
            });

		
	});

    jw.done(function() {
    console.log( "second success" );
    $('.LoadingProducts2').attr('style', 'display:none');
  });
  jw.fail(function() {
    console.log( "error" );
  });
  jw.always(function() {
    console.log( "complete" );
  });
	
}

function topwomenproducts() {
	
	var jw = $.getJSON(serviceURL + 'getsalesbycategory.php?cat='+5+'&count='+7, function(data) {
		$('#home_women').empty();
		products = data;
		$.each(products, function(index, product) {
            var pid = product.ProductID;

			$('#home_women').append(''+
				'<div class="product_wrap">'+
				'<a data-ajax="false" data-transition="slide"  href="productdetail.html?pid='+pid+'">'+
					'<div class="imgwrapper"><img src="'+imgThumb+product.picFileName+'"/></div>'+
					'<div class="info"><h4>'+product.ProductName+'</h4>'+
					'<p>N '+product.prPrice+'</p><span class="btn">Buy</span></div>'+
				'</a>'+
			'</div>'
            );
		});

        $('#home_women').slick({
                slidesToShow: 4,
                slidesToScroll: 1,infinite:true,
                responsive: [
                    {
                        breakpoint:800,
                        settings:{
                            slidesToShow: 4,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:640,
                        settings:{
                            slidesToShow:3,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:480,
                        settings:{
                            slidesToShow:2,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:320,
                        settings:{
                            slidesToShow:1,
                            slidesToScroll: 1,infinite:true
                        }
                    }

                ]
            });

		
	});
     jw.done(function() {
    console.log( "second successtop" );
    $('.LoadingProducts3').attr('style', 'display:none');
  });
  jw.fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });
  jw.always(function() {
    console.log( "completetop" );
  });
	
}

function topmenproducts() {
	
	var jw = $.getJSON(serviceURL + 'getsalesbycategory.php?cat='+6+'&count='+7, function(data) {
		$('#home_men').empty();
		products = data;
		$.each(products, function(index, product) {
            var pid = product.ProductID;

			$('#home_men').append(''+
				'<div class="product_wrap">'+
				'<a data-ajax="false" data-transition="slide"  href="productdetail.html?pid='+pid+'">'+
					'<div class="imgwrapper"><img src="'+imgThumb+product.picFileName+'"/></div>'+
					'<div class="info"><h4>'+product.ProductName+'</h4>'+
					'<p>N '+product.prPrice+'</p><span class="btn">Buy</span></div>'+
				'</a>'+
			'</div>'
            );
		});

        $('#home_men').slick({
                slidesToShow: 4,
                slidesToScroll: 1,infinite:true,
                responsive: [
                    {
                        breakpoint:800,
                        settings:{
                            slidesToShow: 4,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:640,
                        settings:{
                            slidesToShow:3,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:480,
                        settings:{
                            slidesToShow:2,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:320,
                        settings:{
                            slidesToShow:1,
                            slidesToScroll: 1,infinite:true
                        }
                    }

                ]
            });
		
	});
    jw.done(function(){
        $('.LoadingProducts4').attr('style', 'display:none');
    })
	
}


function topjewelleryproducts() {
	
	var jw = $.getJSON(serviceURL + 'getsalesbycategory.php?cat='+1+'&count='+7, function(data) {
		$('#home_jewellery').empty();
		products = data;
		$.each(products, function(index, product) {
            var pid = product.ProductID;

			$('#home_jewellery').append(''+
				'<div class="product_wrap">'+
				'<a data-ajax="false" data-transition="slide"  href="productdetail.html?pid='+pid+'">'+
					'<div class="imgwrapper"><img src="'+imgThumb+product.picFileName+'"/></div>'+
					'<div class="info"><h4>'+product.ProductName+'</h4>'+
					'<p>N '+product.prPrice+'</p><span class="btn">Buy</span></div>'+
				'</a>'+
			'</div>'
            );
		});

         $('#home_jewellery').slick({
                slidesToShow: 4,
                slidesToScroll: 1,infinite:true,
                responsive: [
                    {
                        breakpoint:800,
                        settings:{
                            slidesToShow: 4,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:640,
                        settings:{
                            slidesToShow:3,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:480,
                        settings:{
                            slidesToShow:2,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:320,
                        settings:{
                            slidesToShow:1,
                            slidesToScroll: 1,infinite:true
                        }
                    }

                ]
            });
		
	});
    jw.done(function(){
        $('.LoadingProducts6').attr('style', 'display:none');
    })
	
}

function topkidsproducts() {
	
	var jw = $.getJSON(serviceURL + 'getsalesbycategory.php?cat='+4+'&count='+7, function(data) {
		$('#home_kids').empty();
		products = data;
		$.each(products, function(index, product) {
            var pid = product.ProductID;

			$('#home_kids').append(''+
				'<div class="product_wrap">'+
				'<a data-ajax="false" data-transition="slide"  href="productdetail.html?pid='+pid+'">'+
					'<div class="imgwrapper"><img src="'+imgThumb+product.picFileName+'"/></div>'+
					'<div class="info"><h4>'+product.ProductName+'</h4>'+
					'<p>N '+product.prPrice+'</p><span class="btn">Buy</span></div>'+
				'</a>'+
			'</div>'
            );
		});

        $('#home_kids').slick({
                slidesToShow: 4,
                slidesToScroll: 1,infinite:true,
                responsive: [
                    {
                        breakpoint:800,
                        settings:{
                            slidesToShow: 4,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:640,
                        settings:{
                            slidesToShow:3,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:480,
                        settings:{
                            slidesToShow:2,
                            slidesToScroll: 1,infinite:true
                        }
                    },
                    {
                        breakpoint:320,
                        settings:{
                            slidesToShow:1,
                            slidesToScroll: 1,infinite:true
                        }
                    }

                ]
            });
		
	});
    jw.done(function(){
        $('.LoadingProducts5').attr('style', 'display:none');
    })
	
}

function productsbycategory() {
    
    var id = getUrlVars()["cat"];

    $.getJSON(serviceURL+'getcatbyid.php?cat='+id,  function(data) {
            /*optional stuff to do after success */
            console.log('helo');
            var myjson = data[0];

            if (myjson.ParentCatID != 0){
                $('.categorytitle').text(myjson.ParentCatTitle+' : '+myjson.catTitle);
            }else{
                $('.categorytitle').text(myjson.catTitle);
            }
    });

    $.getJSON(serviceURL + 'getdealsbysubcat.php?cat='+id+'&count='+30, function(data) {
        $('#product_category').empty();
        products = data;
        $.each(products, function(index, product) {
            var pid = product.ProductID;

            $('#product_category').append(''+
                '<div class="product_wrap">'+
                '<a data-ajax="false" data-transition="slide"  href="productdetail.html?pid='+pid+'">'+
                    '<div class="imgwrapper"><img src="'+imgThumb+product.picFileName+'"/></div>'+
                    '<div class="info"><h4>'+product.ProductName+'</h4>'+
                    '<p>N '+product.prPrice+'</p><span class="btn">Buy</span></div>'+
                '</a>'+
            '</div>'
            );
        });
        
    });
    
}

function productdetail(data){
    //var id = getUrlVars()["pid"];
    var productdetails = data;
    var productdetail = productdetails[0];
    console.log(productdetail.ProductName);
    
    $('.productTitle').text(productdetail.ProductName);
    $('.productDesc').html(productdetail.ProductDescription);
    $('.productPrice').text('N '+productdetail.prPrice);
    $('.productLarge').attr('src', imgLarge+ productdetail.picFileName);
}


function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//$("#addtocartBtn")
/*
$(document).on('click', '#addtocartBtn', function(event) {
    event.preventDefault();
    //ldbid, ldbproductname, ldbprice, ldbimage
    var ldb_productname = $('.articleDetail_title').text();
    var ldb_price = $('.articleDetail_content').html();
    var ldb_image = $('.articleDetail_link').find('a').attr('href');
    var p_sqlite_date = 'date';//currentDate
    db.transaction(function (tx) { tx.executeSql(insertStatement, [p_sqlite_title, p_sqlite_desc, p_sqlite_link, p_sqlite_date], savedToFav, onError); });
 

});

*/

$(document).on('click', '.mainCartBtn', function(event) {
    event.preventDefault();
    //var cartTotal = 0;
    db.transaction(function (tx) {
     tx.executeSql(selectAllStatement, [], function (tx, result) {
     var dataset = result.rows;
     console.log(dataset);
     if (dataset.length ==0){
        //popup comes here- no item in cart 
        var msg="You have no items in your cart";
        $('.nocartmsg').append(msg);
      $('.noCartPopUp').popup();
    $('.noCartPopUp').popup('open');

     }else{
        //go to cart.html
        window.location = "cart.html";
     }
 });
 });

});


$("#searchBtnh").on('click', '.selector', function(event) {
    event.preventDefault();
    var searchJQM = $.ajax({  
            //regmembers - registers members and the order.
  url: (serviceURL + 'searchproducts.php'),
  type: "GET",  
  data: {
      search: $('#searchInput').val()
        },
   datatype:"json"
   
    });
        searchJQM.fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });

    
});

$( document ).on( "pagecreate", "#nikit_cart", function() {
    $( "#autocomplete" ).on( "filterablebeforefilter", function ( e, data ) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = "";
        $ul.html( "" );
        if ( value && value.length > 2 ) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview( "refresh" );
            $.ajax({
                url: serviceURL + "searchproducts.php?search="+value+'&count='+10,
                dataType: "json"/*,
                data: {
                    q: $input.val()
                }*/
            })
            .then( function ( response ) {
                $.each( response, function ( i, val ) {
                    html += '<li><a href=""><img src="'+imgSmall+val.picFileName+'"/><h4>'+ val.ProductName + '</h4><p>'+val.ProductDescription+'</p><p>'+val.prPrice+'</p></a></li>';
                });
                $ul.html( html );
                $ul.listview( "refresh" );
                $ul.trigger( "updatelayout");
            });
        }
    });
});

$( document ).on( "pagecreate", "#nikit_search", function() {
    $( "#searchTextBox" ).on( "change", function ( e, data ) {
        var $ul = $( '#searchList' ),
            //$input = $( data.input ),
            value = $( "#searchTextBox" ).val(),//$input.val(),
            html = "";
console.log(value);
        $ul.html( "" );
        if ( value && value.length > 0 ) {
            $("#searchTerm").text(value);
            $ul.html( '<li><div class="LoadingProducts3" style="text-align:left;font-size:16px;"><i class="fa fa-spinner"></i> Searching products...</div></li>' );
            //$ul.listview( "refresh" );
            var searchJQM = $.ajax({
                url: serviceURL + "searchproducts.php?search="+value+'&count='+10,
                dataType: "json"/*,
                data: {
                    q: $input.val()
                }*/
            })
            searchJQM.always(function(response){
$ul.html( '<li><div class="LoadingProducts3" style="text-align:left;font-size:16px;"><i class="fa fa-spinner"></i> Searching products...</div></li>' );
            
            });
            searchJQM .done( function ( response ) {
                if (response=='null'){
                    console.log('nully');
                    $ul.html( '<li><div class="LoadingProducts3" style="text-align:left"><i class="fa fa-warning"></i> No items match your search. Please try again.</div></li>' );
            
                }else{
                $.each( response, function ( i, val ) {
                    html += '<li><a href="productdetail.html?pid='+val.ProductID+'"><img src="'+imgSmall+val.picFileName+'"/><h4>'+ val.ProductName + '</h4><p>'+val.ProductDescription+'</p><p>'+val.prPrice+'</p></a></li>';
                });
                }
                $ul.html( html );
                $ul.listview( "refresh" );
                $ul.trigger( "updatelayout");
                $('.LoadingProducts3').attr('style', 'display:none');
            });
            //searchJQM.fail();
        }
    });
});