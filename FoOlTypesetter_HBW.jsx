// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// Save the current preferences 
var startRulerUnits = app.preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits; 
var startDisplayDialogs = app.displayDialogs;

// Set Adobe Photoshop CS5 to use pixels and display no dialogs
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
app.displayDialogs = DialogModes.NO;


// suppress all dialogs
app.displayDialogs = DialogModes.NO;

// first close all the open documents
while (app.documents.length)
{
	app.activeDocument.close();
}

var processTranslation = function(folder)
{
	var fileList = folder.getFiles("*.txt");
	if(fileList.length > 0)
	{
		if(fileList[0].open('r'))
		{
			var trans = fileList[0].read();
		}
	}
	else
	{
		return false;
	}

	var result = {}
	var lines = trans.match(/[^\r\n]+/g);
	var currentPage = 0;
	for(var i = 0; i < lines.length; i++)
	{
		var page = lines[i].match(/[=]{2,} (страница|page)/i);
		if(page instanceof Array)
		{
			var currentPageTemp = lines[i].match(/(\d+)/g);
			if(!currentPageTemp instanceof Array || currentPageTemp < 1)
			{
				alert("One page didn't have a number coming with it (line " + (i+1) + " " + lines[i] + ")" + currentPageTemp);
				return false;
			}
			currentPage = currentPageTemp[0].replace(/^0+/, '');
			result[currentPage] = [];
		}
		var speech = lines[i].match(/^:([а-яА-яa-zA-Z]+):\s*(\**.*)/i);
		if(speech instanceof Array)
		{
			//alert(lines[i]);
			var character = speech[1];
			var text = speech[2].replace(/^\s{2,}|\s{2,}/g, ' ');
			/*if(character.toLowerCase() == "sfx")
			{
				var betweenAsterisks = text.match(/\*(.*)\*$/);
				if(betweenAsterisks instanceof Array)
				{
					text = betweenAsterisks[1];
				}
			}*/
			result[currentPage].push({character: character, text: text});
		}
	}
	return result;	
}

// black color
var textColor = new SolidColor;
textColor.rgb.red = 0;
textColor.rgb.green = 0;
textColor.rgb.blue = 0;
//  color
var thoughtColor = new SolidColor;
thoughtColor.rgb.red = 47;
thoughtColor.rgb.green = 47;
thoughtColor.rgb.blue = 47;
// white color
var strokeColor = new SolidColor;
strokeColor.rgb.red = 255;
strokeColor.rgb.green = 255;
strokeColor.rgb.blue = 255;

function strokeLayer() {
   function cTID(s) { return app.charIDToTypeID(s); };
   function sTID(s) { return app.stringIDToTypeID(s); };
      var desc56 = new ActionDescriptor();
      var ref44 = new ActionReference();
      ref44.putProperty( cTID('Prpr'), cTID('Lefx') );
      ref44.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
      desc56.putReference( cTID('null'), ref44 );
      
      var desc57 = new ActionDescriptor();
      desc57.putUnitDouble( cTID('Scl '), cTID('#Prc'), 416.666667 ); //300dpi
      
      var desc58 = new ActionDescriptor();
      desc58.putBoolean( cTID('enab'), true );
      desc58.putEnumerated( cTID('Styl'), cTID('FStl'), cTID('OutF') );
      desc58.putEnumerated( cTID('PntT'), cTID('FrFl'), cTID('SClr') );
      desc58.putEnumerated( cTID('Md  '), cTID('BlnM'), sTID('vividLight') );
      desc58.putUnitDouble( cTID('Opct'), cTID('#Prc'), 100.000000 );
      desc58.putUnitDouble( cTID('Sz  '), cTID('#Pxl'), 3.000000 );
      
      var desc59 = new ActionDescriptor();
      desc59.putDouble( cTID('Rd  '), 255.000000 );
      desc59.putDouble( cTID('Grn '), 255.000000 );
      desc59.putDouble( cTID('Bl  '), 255.000000 );
      desc58.putObject( cTID('Clr '), cTID('RGBC'), desc59 );
      desc57.putObject( cTID('FrFX'), cTID('FrFX'), desc58 );
      desc56.putObject( cTID('T   '), cTID('Lefx'), desc57 );

   executeAction( cTID('setd'), desc56, DialogModes.NO );
}

var processFolder = function(folder, translationArr) 
{
	var fileList = folder.getFiles()
	for (var i = 0; i < fileList.length; i++) 
	{
		var file = fileList[i];
		if (file instanceof Folder)
		{
			continue;
		}
		var numArr = fileList[i].name.match(/(\d+)/g);
		if(!(numArr instanceof Array) || !(fileList[i].name.match(/(\d+)(\w+)\.(png|jpg|jpeg)/g))) 
		{
			continue;
		}
	
		var strings = translationArr[numArr[numArr.length-1].replace(/^0+/, '')];
		if(strings instanceof Object)
		{
			open(file);
			var docRef = app.activeDocument;
			//docRef.changeMode(ChangeMode.RGB);
			var newTextLayer = [];
			var j = 0;
			var px = 13;
			var py = 13;
			for(var key in strings)
			{
				newTextLayer[j] = docRef.artLayers.add();
				newTextLayer[j].kind = LayerKind.TEXT;
				newTextLayer[j].textItem.contents = strings[key].text;
				newTextLayer[j].textItem.kind = TextType.PARAGRAPHTEXT;
				newTextLayer[j].textItem.justification = Justification.CENTER;
				newTextLayer[j].textItem.autoKerning = AutoKernType.OPTICAL;
				newTextLayer[j].textItem.antiAliasMethod = AntiAlias.CRISP;
				newTextLayer[j].textItem.position = Array(px, py);
				if (strings[key].character.match(/(заголовок|title)/i))
				{
					// chapter title
					newTextLayer[j].textItem.font = "DigitalStripCyrillic";
					newTextLayer[j].textItem.size = "14 px";
					newTextLayer[j].textItem.width = "235 px";
					newTextLayer[j].textItem.height = "40 px";
					newTextLayer[j].textItem.color = textColor;
				}
				else if (strings[key].character.match(/(мысль|thought)/i))
				{
					// 
					newTextLayer[j].textItem.font = "DigitalStripCyrillic";
					newTextLayer[j].textItem.size = "14 px";
					newTextLayer[j].textItem.width = "235 px";
					newTextLayer[j].textItem.height = "40 px";
					newTextLayer[j].textItem.color = thoughtColor;
					newTextLayer[j].textItem.fauxItalic = true;
				}
				else if (strings[key].character.match(/(крик|noise)/i))
				{
					// 
					newTextLayer[j].textItem.contents = strings[key].text.toUpperCase();
					newTextLayer[j].textItem.font = "ADomIno";
					newTextLayer[j].textItem.size = "18 px";
					newTextLayer[j].textItem.width = "120 px";
					newTextLayer[j].textItem.height = "250 px";
					newTextLayer[j].textItem.color = textColor;
					newTextLayer[j].textItem.fauxItalic = true;
					newTextLayer[j].textItem.fauxBold = true;
				}
				else if (strings[key].character.match(/(звук|sfx)/i))
				{
					// 
					newTextLayer[j].textItem.font = "DigitalStripCyrillic";
					newTextLayer[j].textItem.size = "10 px";
					newTextLayer[j].textItem.width = "235 px";
					newTextLayer[j].textItem.height = "40 px";
					newTextLayer[j].textItem.color = textColor;
				}
				else if (strings[key].character.match(/(заметка|note)/i))
				{
					// 
					newTextLayer[j].textItem.font = "Stylo-Bold";
					newTextLayer[j].textItem.size = "14 px";
					newTextLayer[j].textItem.width = "120 px";
					newTextLayer[j].textItem.height = "250 px";
					newTextLayer[j].textItem.color = textColor;
				}
				else if (strings[key].character.match(/(песня|song)/i))
				{
					// 
					newTextLayer[j].textItem.font = "Adventure";
					newTextLayer[j].textItem.size = "20 px";
					newTextLayer[j].textItem.width = "120 px";
					newTextLayer[j].textItem.height = "250 px";
					newTextLayer[j].textItem.color = textColor;
					newTextLayer[j].textItem.fauxItalic = true;
				}
				else
				{
					newTextLayer[j].textItem.font = "DigitalStripCyrillic";
					newTextLayer[j].textItem.size = "14 px";
					newTextLayer[j].textItem.width = "120 px";
					newTextLayer[j].textItem.height = "250 px";
					newTextLayer[j].textItem.color = textColor;
				}
				newTextLayer[j].textItem.hangingPunctuation = true;
				strokeLayer();
				j++;
				px += 23;
				py += 23;
			}
			var makefolder = Folder(file.path + "/autotypeset/");
			makefolder.create();
			//alert(file.path + "/autotypeset/" + file.name);
			docRef.saveAs(File(file.path + "/autotypeset/" + file.name));
			docRef.close(SaveOptions.DONOTSAVECHANGES);
		}
	}
}
/***
	END OF FUNCTIONS
***/


var imageFolder = Folder.selectDialog("Select top folder to process"); 

if (imageFolder != null)  
{
      var translationArr = processTranslation(imageFolder);
      if(translationArr != false)
      {
		  processFolder(imageFolder, translationArr);
      }
}


// set things back
app.preferences.rulerUnits = startRulerUnits;
app.preferences.typeUnits = startTypeUnits; 
app.displayDialogs = startDisplayDialogs;

// unset stuff
filesArr = null;
