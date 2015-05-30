var first='src/main.js'
var output='NamuFix.user.js';

var fs=require('fs');
function RemoveDup(arr){
  var arr1=[];
  for(var i=0;i<arr.length;i++){
    if(arr1.indexOf(arr[i])==-1)
      arr1.push(arr[i]);
  }
  return arr1;
}
function getIncluded(fn){
  var read=fs.readFileSync(fn,{encoding:"utf8"});
  var IncludePattern=/\/\*\* Include\("(.+?)"\) \*\*\//g;
  if(read.search(IncludePattern)==-1){
    return read;
  }
  var filenames=[];
  while(true){
    var matched=IncludePattern.exec(read);
    if(matched==null) break;
    matched=matched[1];
    filenames.push(matched);
  }
  filenames=RemoveDup(filenames);
  for(var i=0;i<filenames.length;i++){
    console.log('Working with '+filenames[i]);
    var brp='/** Include(\"'+filenames[i]+'\") **/';
    while(read.indexOf(brp)!=-1){
      console.log('Replacing in '+fn);
      read=read.replace(brp,getIncluded(filenames[i]));
    }
  }
  return read;
}
fs.writeFileSync(output,getIncluded(first),{"encoding":"utf8"});
