// set the focus to the input box
document.getElementById("inputText").focus();
AWS.config.region = "us-east-2";
var ep = new AWS.Endpoint("https://translate.us-east-2.amazonaws.com");

AWS.config.credentials = new AWS.Credentials(
  key.translateKey,
  key.translateSecret
);

var translate = new AWS.Translate({endpoint: ep, region: AWS.config.region });

AWS.config.credentials = new AWS.Credentials(key.pollyKey, key.pollySecret);
var polly = new AWS.Polly();

function doTranslate() {
  var inputText = document.getElementById("inputText").value;
  if (!inputText) {
    alert("Input text cannot be empty.");
    exit();
  }
  // get the language codes
  var sourceDropdown = document.getElementById("sourceLanguageCodeDropdown");
  var sourceLanguageCode =
    sourceDropdown.options[sourceDropdown.selectedIndex].text;
  var targetDropdown = document.getElementById("targetLanguageCodeDropdown");
  var targetLanguageCode =
    targetDropdown.options[targetDropdown.selectedIndex].text;
  var params = {
    Text: inputText,
    SourceLanguageCode: sourceLanguageCode,
    TargetLanguageCode: targetLanguageCode
  };
  translate.translateText(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      alert("Error calling Amazon Translate. " + err.message);
      return;
    }
    if (data) {
      var outputTextArea = document.getElementById("outputText");
      outputTextArea.value = data.TranslatedText;
    }
  });
}
function doSynthesizeInput() {
  var text = document.getElementById("inputText").value.trim();
  if (!text) {
    return;
  }
  var sourceLanguageCode = document.getElementById("sourceLanguageCodeDropdown")
    .value;
  doSynthesize(text, sourceLanguageCode);
}
function doSynthesizeOutput() {
  var text = document.getElementById("outputText").value.trim();
  if (!text) {
    return;
  }
  var targetLanguageCode = document.getElementById("targetLanguageCodeDropdown")
    .value;
  doSynthesize(text, targetLanguageCode);
}
function doSynthesize(text, languageCode) {
  var voiceId;
  switch (languageCode) {
    case "de":
      voiceId = "Marlene";
      break;
    case "en":
      voiceId = "Joanna";
      break;
    case "es":
      voiceId = "Penelope";
      break;
    case "fr":
      voiceId = "Celine";
      break;
    case "pt":
      voiceId = "Vitoria";
      break;
    default:
      voiceId = null;
      break;
  }
  if (!voiceId) {
    alert(
      'Speech synthesis unsupported for language code: "' + languageCode + '"'
    );
    return;
  }
  var params = {
    OutputFormat: "mp3",
    SampleRate: "8000",
    Text: text,
    TextType: "text",
    VoiceId: voiceId
  };
  polly.synthesizeSpeech(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      alert("Error calling Amazon Polly. " + err.message);
    } else {
      var uInt8Array = new Uint8Array(data.AudioStream);
      var arrayBuffer = uInt8Array.buffer;
      var blob = new Blob([arrayBuffer]);
      var url = URL.createObjectURL(blob);
      audioElement = new Audio([url]);
      audioElement.play();
    }
  });
}
function clearInputs() {
  document.getElementById("inputText").value = "";
  document.getElementById("outputText").value = "";
  document.getElementById("sourceLanguageCodeDropdown").value = "en";
  document.getElementById("targetLanguageCodeDropdown").value = "fr";
}
