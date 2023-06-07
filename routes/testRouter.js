const testRouter = express.Router();
import express from 'express';
const app = express();

testRouter.post('/findPostId', async function (req, res) {
    try {
        const countSpam = 2;
        let originalUrl = ['https://www.facebook.com/photo/?fbid=575347754742660&set=a.508166581460778', 'https://www.facebook.com/broadpangmkt/photos/a.172431668072058/383496090298947/']
        let texts = [
            ['aaaaaaaaa', 'bbbbbbbbb', 'cccccccccc'],
            ['dddddddddddd', 'ttttttttttttttttttttt'],
            ['ooooooooooo', 'pppppppppppp', 'hhhhhhhhhhhhh']
        ];
        const promises = originalUrl.map(async (oURL) => {
            let postId = await getPostId(oURL)
            return { originalUrl: oURL, postId }
        })

        const results = await Promise.all(promises)
        for (const data of results) {
            let textArr = [];
            for (let i = 0; i < countSpam; i++) {
                const combinedText = await Promise.all(
                    texts.map(async (text) => {
                        return await getRandomItem(text);
                    })
                ).then((resolvedTexts) => resolvedTexts.join('\n'));
                textArr.push(combinedText);
            }

            if (!data.postId) {
                //checkCountUsersLogin
                //getUser
                //insert q_spamAds
            }

        }

        res.json(results)
    } catch (error) {
        console.log(error)
    }
});

async function spamAdPosts(postId, textArr) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let i = 0
    return new Promise(async (resolve) => {
        do {
            console.log("postId", postId, 'textArr', textArr[i])
            i++
            await delay(10000)
        } while (i < textArr.length)
        if (i == textArr.length) {
            resolve({
                status: "success"
            })
        }
    })

}

async function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function getPostId(originalUrl) {
    return new Promise(async function (resolve, reject) {
        const checkUrlFacebook = originalUrl.match(/([a-z]+\:\/+)([^\/\s]*)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/ig);
        if (checkUrlFacebook) {
            let replaceUrl = originalUrl.replace("https\:\/\/", "").replace("http\:\/\/", "").replace("\:\/\/", "");
            let splitUrl = replaceUrl.split("\/");
            if (splitUrl[0].match(".facebook.com")) {
                if (splitUrl[1].split("?")) {
                    if (splitUrl[1] && splitUrl[1] != "") {
                        let urlCollect = [];
                        let locationSearch = '';
                        for (let index = 1; splitUrl[index]; index++) {
                            if (splitUrl[index].split("\?")[0] && splitUrl[index].split("\?")[0] != "") {
                                urlCollect.push(splitUrl[index].split("\?")[0]);
                            }
                            if (splitUrl[index].split("\?")[1] && splitUrl[index].split("\?")[1] != "") {
                                locationSearch = "\?" + splitUrl[index].split("\?")[1];
                            }
                        }
                        let postId = await getParam('fbid', locationSearch);
                        if (postId != "") {
                            resolve(postId)
                        } else if (originalUrl.match("\/photos\/")) {
                            let splited = originalUrl.split("/");
                            let postId = splited[splited.length - 2];
                            resolve(postId)
                        } else if (urlCollect[1] == "videos") {
                            resolve(urlCollect[2])
                        } else {
                            resolve(false)
                        }
                    }
                    else {
                        console.log('เกิดข้อผิดพลาด', 'ไม่สามารถดึง ID กรุณากรอก URL อื่น', 'error', originalUrl);
                        resolve(false)
                    }
                }
            }
            else {
                console.log('เกิดข้อผิดพลาด', 'URL ที่ใส่ ต้องเป็น URL ของ Facebook', 'error', originalUrl);
                resolve(false)
            }
        }
        else {
            console.log('นี่ไม่ใช่ URL ', 'กรุณากรอก URL ของ Facebook', 'error', originalUrl);
            resolve(false)
        }
    });
}

async function getParam(sname, locationSearch) {
    if (locationSearch && sname) {
        var params = locationSearch.substr(locationSearch.indexOf("?") + 1);
        var sval = "";
        params = params.split("&");
        for (var i = 0; i < params.length; i++) {
            var temp = params[i].split("=");
            if ([temp[0]] == sname) { sval = temp[1]; }
        }
        return sval;
    } else {
        return '';
    }
}



export { testRouter };