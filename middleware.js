module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
           req.session.redirectUrl = req.originalUrl;
          req.flash("error","You must be loggedin to access this feature")
          res.redirect("/login")
       
    }
next();
}

module.exports.saveRedirectUrl= (req,res,next)=>{
    if(req.session.redirectUrl){
        res.local.redirectUrl = req.session.redirectUrl;
    }
    next();
}