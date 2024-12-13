
export interface Chat {
    _id: string;
    name: string;
    members: Member[];
    groupChat: boolean
};

export interface TransformedChat {
    _id: string,
    groupChat: boolean;
    avatar: string[];
    name: string;
    members: string[];
};

export interface Member {
    _id: string
    avatar: {url: string};
    name: string;
};

export interface ChatDetailedMember {
    _id: string;
    name: string;
    avatar: string;
};

export interface Notification {
    _id: string;
    sender: {
        _id: string,
        name: string,
        avatar: string ,
    }
};