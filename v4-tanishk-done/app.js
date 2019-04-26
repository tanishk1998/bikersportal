var express                      = require("express"),
      app                          = express(),
    bodyParser                 = require("body-parser"),
    User                           = require("./modules/users"),
    Comment                      = require("./modules/comment"),
    Bike                           = require("./modules/bike"),
    Post                           = require("./modules/post"),
    Group                       = require("./modules/group")
    mongoose                     = require("mongoose"),
    passport                     = require("passport"),
    localStratergies       = require("passport-local"),
    cookieParser           = require('cookie-parser'),
    FacebookStrategy       = require('passport-facebook').Strategy,
    ejs                            = require("ejs"),
    DateOnly               = require('mongoose-dateonly')(mongoose),
    methodOverride             = require("method-override"),
    GoogleStrategy         = require('passport-google-oauth').OAuth2Strategy,
      passportLocalMongoose  = require("passport-local-mongoose"),
    multer                 = require('multer'),
    fs                     = require('fs'),
    flash                  = require('connect-flash'),
    cloudinary             = require("cloudinary")
    path                   = require("path");

const { Translate } = require('@google-cloud/translate'),
    vision = require('@google-cloud/vision');
var { google } = require('googleapis');

const storage = multer.diskStorage({
    destination: __dirname + '/public/imageuploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).any();
// Cloudinary setup
cloudinary.config({
    cloud_name:'dseyaumam',
    api_key:'757859675353735',
    api_secret:'KuAogemqXJFjRyKWnVS27ynoFQA'
});
// language directory
var lang = [
    {
        name: "Afrikaans",
        target: "af"
    },
    {
        name: "Arabic",
        target: "ar"
    },
    {
        name: "Assamese",
        target: "as"
    },
    {
        name: "Azerbaijani",
        target: "az"
    },
    {
        name: "Belarusian",
        target: "be"
    },
    {
        name: "Bengali",
        target: "bn"
    },
    {
        name: "Bulgarian",
        target: "bg"
    },
    {
        name: "Catalan",
        target: "ca"
    },
    {
        name: "Chinese",
        target: "zh"
    },
    {
        name: "Croatian",
        target: "hr"
    },
    {
        name: "Czech",
        target: "cs"
    },
    {
        name: "Danish",
        target: "da"
    },
    {
        name: "Dutch",
        target: "nl"
    },
    {
        name: "English",
        target: "en"
    },
    {
        name: "Estonian",
        target: "et"
    },
    {
        name: "Filipino",
        target: "fil"
    },
    {
        name: "Finnish",
        target: "fi"
    },
    {
        name: "French",
        target: "fr"
    },
    {
        name: "German",
        target: "de"
    },
    {
        name: "Greek",
        target: "el"
    },
    {
        name: "Hebrew",
        target: "he"
    },
    {
        name: "Hindi",
        target: "hi"
    },
    {
        name: "Hungarian",
        target: "hu"
    },
    {
        name: "Icelandic",
        target: "is"
    },
    {
        name: "Indonesian",
        target: "id"
    },
    {
        name: "Italian",
        target: "it"
    },
    {
        name: "Japanese",
        target: "ja"
    },
    {
        name: "Kazakh",
        target: "kk"
    },
    {
        name: "Korean",
        target: "ko"
    },
    {
        name: "Kyrgyz",
        target: "ky"
    },
    {
        name: "Latvian",
        target: "lv"
    },
    {
        name: "Lithuanian",
        target: "lt"
    },
    {
        name: "Macedonian",
        target: "mk"
    },
    {
        name: "Marathi",
        target: "mr"
    },
    {
        name: "Mongolian",
        target: "mn"
    },
    {
        name: "Nepali",
        target: "ne"
    },
    {
        name: "Norwegian",
        target: "no"
    },
    {
        name: "Pashtu",
        target: "ps"
    },
    {
        name: "Persian",
        target: "fa"
    },
    {
        name: "Polish",
        target: "pl"
    },
    {
        name: "Portuguese",
        target: "pt"
    },
    {
        name: "Romanian",
        target: "ro"
    },
    {
        name: "Russian",
        target: "ru"
    },
    {
        name: "Sanskrit",
        target: "sa"
    },
    {
        name: "Serbian",
        target: "sr"
    },
    {
        name: "Slovak",
        target: "sk"
    },
    {
        name: "Slovenian",
        target: "sl"
    },
    {
        name: "Spanish",
        target: "es"
    },
    {
        name: "Swedish",
        target: "sv"
    },
    {
        name: "Tamil",
        target: "ta"
    },
    {
        name: "Thai",
        target: "th"
    },
    {
        name: "Turkish",
        target: "tr"
    },
    {
        name: "Ukrainian",
        target: "uk"
    },
    {
        name: "Urdu",
        target: "ur"
    },
    {
        name: "Uzbek",
        target: "uz"
    },
    {
        name: "Vietnamese",
        target: "vi"
    }
];

// ROUTE MODULES
var userRoutes        = require("./routes/user"),
    indexRoutes       = require("./routes/index"),
    commentRoutes     = require("./routes/comments"),
    bikeRoutes        = require("./routes/bike"),
    postRoutes        = require("./routes/posts");
    groupRoutes       = require("./routes/group");
// connecting to the database
mongoose.connect("mongodb://localhost:27017/bikersportal_v3", { useNewUrlParser: true });


// GOOGLE AUTHENTICATION
passport.use(new GoogleStrategy({
    clientID: "28687885174-ab3bsihq00isq8q1tolenv3lrdnc4fv5.apps.googleusercontent.com",
    clientSecret: "l67GmyvL4V-fuYDc9UWzi2GZ",
    callbackURL: "http://localhost:7777/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      process.nextTick(function(){
                User.findOne({'google.id': profile.id}, function(err, user){
                  console.log(profile);
                  if(err)
                    return done(err);
                  if(user)
                    return done(null, user);
                  else {
                    var newUser = new User();
                    newUser.google.id = profile.id;
                    // newUser.google.token = accessToken;
                    newUser.username=profile.displayName;
                    newUser.name = profile.displayName;
                    newUser.email = profile.emails[0].value;

                    newUser.save(function(err){
                      if(err)
                        throw err;
                      return done(null, newUser);
                    })
                    console.log(profile);
                  }
                });
      });
  }
));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(flash());

 // PASSPORT CONFIGURATION

app.use(require("express-session")({
    secret:"minor project 2k19",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
// User.authenticate() is present in the passport-local-mongoose package so it must also be defined in the user model 
passport.use(new localStratergies(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
// FACEBOOK AUTHENTICATION 
passport.use(new FacebookStrategy({
    clientID:"2075633425865758",
    clientSecret:"9231770348543ce0efce3182bc35299e" ,
    callbackURL: "http://localhost:7777/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
              User.findOne({'facebook.id': profile.id}, function(err, user){
                if(err)
                  return done(err);
                if(user)
                  return done(null, user);
                else {
                  console.log(profile);
                  var newUser = new User();
                  newUser.facebook.id = profile.id;
                  newUser.facebook.token = accessToken;
                  newUser.name = profile.displayName;
                  newUser.username = profile.displayName;
                  // newUser.email = profile.emails[0].value;

                  newUser.save(function(err){
                    if(err)
                      throw err;
                    return done(null, newUser);
                  })
                  console.log(profile);
                }
              });
            });
  }
));

// to make the current user available in every template
// can also be used  to send any data that we wish to share on all the pages
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
  res.locals.message=req.flash("error");
    next();
});


// =======================
// ROUTES 
// =======================

app.use(indexRoutes);
app.use("/profile",userRoutes);
app.use("/bikes",bikeRoutes);
app.use("/posts",postRoutes);
app.use("/posts/:id/comments",commentRoutes);
app.use("/group",groupRoutes);
// Flint
app.get("/flint",isLoggedIn ,function (req, res) {
    res.render("flint/capture", { language: lang });
})
app.post("/flint",isLoggedIn,function (req, res) {
    try {
        upload(req, res, (err) => {
            if (err) {
                res.render("flint/capture", { filemsg: err, language: lang });
            }
            else {
                if (!req.files) {
                    res.render("flint/capture", { filemsg: "File Not Selected.", language: lang });
                }
                else {
                    if (!req.body.translate) {
                        res.render("flint/capture", { filemsg: "Language Not Selected.", language: lang });
                    }
                    else {
                        console.log(req.files);

                        var target;
                        var text1;
                        var language = req.body.translate;
                        const projectId = 'flint3-217211';
                        for (var i = 0; i < lang.length; i++) {
                            if (language == lang[i].name) {
                                target = lang[i].target;
                                break;
                            }
                        }


                        // Instantiates a client
                        const translate = new Translate({
                            projectId: projectId,
                            key: "AIzaSyBGVvoRgKPw06up7cYTwi_00lCy34u5gBY"
                        });


                        // Creates a client
                        const client = new vision.ImageAnnotatorClient({
                            projectId: 'flint02-215106',
                            keyFilename: 'flint02-215106-5bd71205e313.json'

                        });
                        client
                            .textDetection( req.files[0].path)
                            .then(results => {
                                const detections = results[0].textAnnotations;

                                if (detections[0]) {
                                    var text = detections[0].description;

                                    //  translate


                                    translate
                                        .detect(text)
                                        .then(results => {
                                            let detections = results[0];
                                            detections = Array.isArray(detections) ? detections : [detections];
                                            
                                            translate
                                                .translate(text, target)
                                                .then(results => {
                                                    const translation = results[0];
                                                    res.render("flint/translate", { text: text, translation: translation, detect: detections, lang: lang })
                                                })
                                                .catch(err => {
                                                    res.render("flint/capture", { filemsg: "File Parsing Error, Try Again. [File or Language May Not Be Supported]", language: lang });
                                                })

                                                .catch(err => {
                                                    res.render("flint/capture", { filemsg: "File Parsing Error, Try Again. [File or Language May Not Be Supported]", language: lang });
                                                })
                                                .catch(err => {
                                                    res.render("flint/capture", { filemsg: "File Parsing Error, Try Again. [File or Language May Not Be Supported]", language: lang });
                                                })
                                        })
                                }
                                else {
                                    res.render("flint/capture", { filemsg: "File Parsing Error, Try Again. [File Type May Not Be Supported or Nothing Detected]", language: lang });
                                }
                            })
                    }
                }
            }
        });
    }
    catch (err) {
        res.render("capture", { filemsg: "File Parsing Error, Try Again. [File Type May Not Be Supported]", language: lang });
    }
});
app.post("/sign-up",function(req,res){

      upload(req,res,function(err){
        if(req.files){
            cloudinary.uploader.upload(req.files[0].path, function(result) { 
                var profilePhoto =result.secure_url;
                  var username=req.body.username;
                  var name=req.body.name;
                  var email=req.body.email;
                  var address=req.body.address;
                  var age=req.body.age;
                  var description=req.body.description;
                  if(age<18){
                    req.flash('error', 'Sorry, you need to be atleast 18 years to register');
                    return res.redirect("back");
                  }
                  else{
                    User.find({username:username},function(err,foundUser){
                      if(foundUser.lenght<0){
                        req.flash("error","Sorry, username already exists please select another");
                        return res.redirect("back");
                      }
                    })
                    var obj = {
                          username:username,
                          name:name,
                          email:email,
                          profilePhoto:profilePhoto,
                          address:address,
                          age:age,
                          description:description
                    };
                    User.register(new User(obj),req.body.password,function(err,user){
                      if (err) {
                        console.log(err);
                        return res.render("signup");
                      }
                      passport.authenticate("local")(req,res,function(){
                        res.redirect("/profile");
                      })
                     })
                 }

                })
        }
        
    });
        
     
});
function isLoggedIn(req,res,next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
// LISTEN FOR REQUESTS

app.listen(7777,function(){
    console.log("SERVER INITIATED..................");
});