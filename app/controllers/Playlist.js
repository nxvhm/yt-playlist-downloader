import 'dotenv/config' 

export const GetPlaylistInfoForm = (req, res) => {
    return res.render('playlist')
}
//https://youtube.googleapis.com/youtube/v3/playlistItems?playlistId=PL1IU4H9Dvninizk2jajFt_J9GuCH_fTIX&maxResults=50&part=snippet&key=AIzaSyBkIP_kN-mjfAHu4OwzwXu_C3Bnx0bYNk0
export const GetPlaylistContents = (req, res) => {

    let url;

    try {

        url = new URL(req.body.url);

    } catch (error) {
        return res.json({success: 0, error: 1, msg: error.message});
    }
    
    let playlistId = url.searchParams.get('list');

    if (!playlistId) {
        return res.json({success: 0, error: 1, msg: 'Playlist id cannot be found'});
    }
    console.log(process.env.YT_KEY)
    console.log('playlist to fetch info for:', playlistId);
}