const { db } = require("../config/firebaseAdmin");
const { io } = require("../server");

exports.listenToNotifications = () => {
  db.collection("notifications").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const notification = {
        id: change.doc.id,
        ...change.doc.data(),
      };

      const { userId } = notification;
      if (!userId) return;

      if (change.type === "added") {
        io.to(userId).emit("notification:new", notification);
      }

      if (change.type === "modified") {
        io.to(userId).emit("notification:update", notification);
      }

      if (change.type === "removed") {
        io.to(userId).emit("notification:delete", notification.id);
      }
    });
  });

  console.log("🔥 Real-time notifications listener started");
};
