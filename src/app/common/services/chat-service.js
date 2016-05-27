/**
 * @ngdoc service
 * @name just.service.service:chatService
 * @description
 * # chatService
 * Service to handle Chat.
 */
angular.module('just.service')
    .service('chatService', ['i18nService', 'Resources', 'authService','$q', function (i18nService, Resources, authService,$q) {

        var that = this;

        //this.chatMessage = {}
        this.chatId = undefined;
        this.chatMessageModel = {data: {attributes: {body: ""}}};
        this.message = {};
        this.chatMessages = {data: []};
        this.chatModel = {data: {attributes: {"user-ids": []}}};

        this.getChatList = function () {
            return Resources.chats.get();
        };

        this.getChat = function () {
            return Resources.chat.get({id: that.chatId, 'include': 'user-images'});
        };

        this.getChatMessage = function () {
            if (angular.isObject(that.chatId)) {
                that.chatMessages = {data: []};
                return that.chatMessages;
            } else {
                return Resources.chatMessage.get({id: that.chatId, 'include': 'author'});
            }
        };

        this.getUserChat = function () {
            return Resources.userChat.get({user_id: authService.userId().id});
        };

        this.newChat = function (fn) {
            Resources.chats.create({}, that.chatModel, function (response) {
                that.chatId = response.data.id;
                that.newChatMessage(fn);
            }, function (response) {
                that.message = response;
            });
        };

        this.setChatId = function (chat_id) {
            if (angular.isObject(chat_id)) {
                that.chatId = undefined;
            } else {
                that.chatId = chat_id;
                that.chatDetail = that.getChat();
            }
        };

        this.clearChat = function () {
            that.chatId = undefined;
            that.chatMessageModel = {data: {attributes: {body: ""}}};
            that.message = {};
            that.chatMessages = {data: []};
            that.chatModel = {data: {attributes: {"user-ids": []}}};
        };

        this.newChatMessage = function (fn) {
            if (that.chatId) {
                var formData = {};
                angular.copy(that.chatMessageModel, formData);
                that.chatMessageModel.data.attributes.body = "";
                Resources.chatMessage.create({id: that.chatId}, formData, function (response) {
                    if (fn) {
                        fn(that.chatId);
                    }
                });
            } else {
                that.newChat(fn);
            }
        };

    }]);
