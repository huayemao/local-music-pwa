export const config = {
    // iceTransportPolicy: 'relay',
    iceServers: [
        // {
        //   urls: 'stun:hk-turn1.xirsys.com',
        // },
        // {
        //   urls: 'stun:stun.softjoys.com',
        // },
        // {
        //   urls: 'stun:stun.voipbuster.com:3478',
        // },
        {
            username: 'EvcKbZMh4KduyQon1Bessr9YSruwyUJ9Jb2jHeCRp1pZwNGMauzxecSVJE0bIvmcAAAAAGWWTJBodWF5ZW1hbw==',
            urls: [
                'stun:hk-turn1.xirsys.com',
                'turn:hk-turn1.xirsys.com:80?transport=udp',
                'turn:hk-turn1.xirsys.com:3478?transport=udp',
                'turn:hk-turn1.xirsys.com:80?transport=tcp',
                'turn:hk-turn1.xirsys.com:3478?transport=tcp',
                'turns:hk-turn1.xirsys.com:443?transport=tcp',
                'turns:hk-turn1.xirsys.com:5349?transport=tcp',
            ],
            credential: '6568f5f6-aac8-11ee-9a24-0242ac120004',
        },
        // {
        //   username:
        //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
        //   url: 'turn:hk-turn1.xirsys.com:80?transport=udp',
        //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
        // },
        // {
        //   username:
        //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
        //   url: 'turn:hk-turn1.xirsys.com:3478?transport=udp',
        //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
        // },
        // {
        //   username:
        //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
        //   url: 'turn:hk-turn1.xirsys.com:80?transport=tcp',
        //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
        // },
        // {
        //   username:
        //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
        //   url: 'turn:hk-turn1.xirsys.com:3478?transport=tcp',
        //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
        // },
        // {
        //   username:
        //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
        //   url: 'turns:hk-turn1.xirsys.com:443?transport=tcp',
        //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
        // },
        // {
        //   username:
        //     '3NV43Qdd5R_-W4Xo2P8T3DQcY_we0vczKqZizyY7f50zA5dVfQzc61D-_03r0h1NAAAAAGWWNUpodWF5ZW1hbw==',
        //   url: 'turns:hk-turn1.xirsys.com:5349?transport=tcp',
        //   credential: '861816d2-aaba-11ee-9bee-0242ac120004',
        // },
    ],
};
