export function isGlobalSettingsSet(settings) {
    const globalSettings = settings;
    return globalSettings.host !== undefined || globalSettings.port !== undefined;
}
export async function fetchApi({ body, endpoint, method, accessToken }) {
    return await (await fetch(`http://localhost:21420${endpoint}`, {
        method,
        // headers: {
        //   Authorization: `Bearer ${accessToken}`,
        // },
        body,
    })).json();
}
/**
 * Try call IDE built-in HTTP Service
 * @param body
 * @param endpoint
 * @param method
 * @param accessToken
 * @param host
 * @param port
 */
export async function fetchJetBrainsIDE({ body, endpoint, method, password, host, port }) {
    if (port !== undefined && port !== null && port !== '') {
        try {
            // await fetch(`http://${host}:${port}${endpoint}`, {
            //     method,
            //     headers: {
            //         Authorization: `${password}`,
            //     },
            //     body,
            // })
            // net::ERR_CONNECTION_REFUSED
            fetch(`http://${host}:${port}${endpoint}`, {
                method,
                headers: {
                    Authorization: `${password}`,
                },
                body,
            }).catch(err => console.log('fetchJetBrainsIDE Failed', err.message));
        }
        catch (e) {
            console.log(e);
        }
    }
    else {
        for (let i = 63342; i <= 63352; i++) {
            console.log(`fetch http://${host}:${i}${endpoint}`);
            try {
                // 2023 Sep 8, this await fetch will throw 404 exception then only do the first loop skip the rest,
                // try-catch doesn't work here, nave no idea about the reason
                // await fetch(`http://${host}:${i}${endpoint}`, {
                //     method,
                //     headers: {
                //         Authorization: `${password}`,
                //     },
                //     body,
                // })
                // net::ERR_CONNECTION_REFUSED
                fetch(`http://${host}:${i}${endpoint}`, {
                    method,
                    headers: {
                        Authorization: `${password}`,
                    },
                    body,
                })
                    // .then(response => response.json())
                    // .then(json => console.log(json))
                    .catch(err => console.log('fetchJetBrainsIDE Failed', err.message));
                // console.log(api_call.status);
            }
            catch (e) {
                console.log("fetchJetBrainsIDE failed:" + e);
            }
        }
    }
}
