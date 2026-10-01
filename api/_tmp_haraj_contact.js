export default async function handler(req,res){
  const query = `query PostContactQuery($postId: Int!, $isManualRequest: Boolean) {
    postContact(postId: $postId, isManualRequest: $isManualRequest) {
      contactText, contactMobile, shouldEnableWhatsApp
    }
  }`;
  const url = "https://graphql.haraj.com.sa/?queryName=postContact&clientId=ukCF3x0g-lr4r-fkTY-1Uqm-YZs991uGF01vv3&version=N0.0.1%20,%202026-08-11%2022/";
  try{
    const r = await fetch(url,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Origin":"https://haraj.com.sa",
        "Referer":"https://haraj.com.sa/",
        "User-Agent":"Mozilla/5.0",
        "Accept":"*/*"
      },
      body:JSON.stringify({query,variables:{postId:11157057841,isManualRequest:true}})
    });
    const text = await r.text();
    res.status(200).json({upstreamStatus:r.status,body:text});
  }catch(e){res.status(500).json({error:String(e)})}
}