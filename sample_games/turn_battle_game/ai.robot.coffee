       
( ->
    s = document.getElementsByTagName("script")
    d = s[s.length-1].src.substring(0, s[s.length-1].src.lastIndexOf("/")+1)
    for arg in arguments
        document.write('<script type="text/javascript" src="'+d+arg+'"></script>')
)(
    "third_party/enchant.js/src/enchant.min.js",
    "third_party/underscore-min.js",
    "EnchantAI/cmd.js",
    "EnchantAI/instruction.js",
    "config.js",
    "utility/debug.js",
    "robot.js",
    "background.js",
    "main.js"
    
)

