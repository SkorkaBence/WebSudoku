declare var CSF : CSF_SDK;
declare var csfAsyncInit : Function|undefined;

interface CSF_SDK {
    init(data : CSF_INIT) : void;
    login(callback? : CSF_LoginStatusCallback, data? : CSF_LOGIN) : void;
    logout() : void;
    getLoginStatus(callback : CSF_LoginStatusCallback) : void;
    api(api : string, apidata : CSF_API) : void;
}

interface CSF_INIT {
    client_id? : string;
    key? : string;
    token_cookie? : string;
    access_token? : string;
    csfxml? : boolean;
}

interface CSF_LOGIN {
    client_id? : string;
    redirect_uri? : string;
}

interface CSF_API {
    method? : string;
    query? : {[id: string] : string};
    content? : any;
    success? : CSF_ApiSuccessCallback;
    error? : CSF_ApiErrorCallback;
    access_token? : string;
    key? : string;
}

type CSF_LoginStatusCallback = (status : CSF_LOGIN_STATUS) => void;

interface CSF_LOGIN_STATUS {
    status : boolean;
    accessToken? : string;
}

type CSF_ApiSuccessCallback = (data : any) => void;
type CSF_ApiErrorCallback = (data : any) => void;