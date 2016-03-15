[
  '{{repeat(5, 7)}}',
  {
  messageID: '{{objectId()}}',
  message: '{{lorem(1, "paragraphs")}}',
  createdDate: '{{date(new Date(2014, 0, 1), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}',
  channelId: 'youtube',
  userId: function (tags) {
      var users = ['nolan', 'sunzhx', 'tupaje'];
      return users[tags.integer(0, users.length - 1)];
    },
  verified: '{{bool()}}',
  upvoteCount: '{{integer(10, 999)}}'
  }
]