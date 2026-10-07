export default function handler(req,res){
  res.status(200).json({
    ok:true,
    service:'Digital Arhat Follow-up Radar',
    time:new Date().toISOString(),
    hmacConfigured:!!process.env.VGRAPLE_WEBHOOK_SECRET,
    storageConfigured:!!process.env.BLOB_READ_WRITE_TOKEN
  });
}
