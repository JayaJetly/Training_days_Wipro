using Microsoft.AspNetCore.SignalR;

namespace FractoBackend.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendNotificationToUser(string userId, string message)
        {
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }

        public async Task SendNotificationToAdmin(string message)
        {
            await Clients.Group("Admins").SendAsync("ReceiveNotification", message);
        }

        public override async Task OnConnectedAsync()
        {
            // Add user to a group based on their role, if applicable
            // For example, if user is an admin, add them to "Admins" group
            // if (Context.User.IsInRole("Admin"))
            // {
            //     await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            // }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Remove user from groups if added
            // if (Context.User.IsInRole("Admin"))
            // {
            //     await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
            // }
            await base.OnDisconnectedAsync(exception);
        }
    }
}