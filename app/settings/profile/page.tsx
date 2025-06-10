"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Separator } from "components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Check,
  Star,
  LogOut,
  AlertCircle,
  X,
} from "lucide-react";
import { useAccounts, Account } from "state/accounts";
import { Alert, AlertDescription } from "components/ui/alert";
import { SignInForm } from "components/forms/sign-in-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";

export default function ProfilePage() {
  const user = useQuery(api.auth.loggedInUser);
  const { signOut } = useAuthActions();
  const {
    accounts,
    addAccount,
    removeAccount,
    switchToAccount,
    isValidatingAccount,
  } = useAccounts();

  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    } else if (user?.email) {
      // Format email as name if no name is set
      const emailName = user.email.split("@")[0].replace(/[._]/g, " ");
      setDisplayName(emailName.replace(/\b\w/g, (l) => l.toUpperCase()));
    }
  }, [user]);

  // Generate initials from name or email
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    if (email) {
      return email.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Here you would handle saving the profile changes to your backend
    // For now, we'll just simulate success
    try {
      setIsEditing(false);
      toast.success("Profile updated successfully");

      // Reset the file input
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = () => {
    const logout = () => {
      signOut().catch((e) => console.error("Error signing out:", e));
    };
    logout();
  };

  const handleAddAccount = (data: { email: string; name?: string }) => {
    // The account will be added automatically by the useEffect in SignInForm
    // when the user signs in with OAuth
    setShowAddAccountDialog(false);
  };

  const handleRemoveAccount = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    // Don't allow removing the current account
    if (account.current) {
      toast.error("Cannot remove the current account");
      return;
    }

    removeAccount(accountId);
    toast.success("Account removed");
  };

  const handleSwitchAccount = (accountId: string) => {
    switchToAccount(accountId);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p className="text-sm text-muted-foreground">
            Update your account profile details and preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[200px_1fr] items-start">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-32 h-32 border-2 border-border">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={displayName} />
              ) : (
                <>
                  <AvatarImage src={user?.image || ""} alt={displayName} />
                  <AvatarFallback className="text-3xl">
                    {getInitials(displayName, user?.email)}
                  </AvatarFallback>
                </>
              )}
            </Avatar>

            <div className="flex space-x-2">
              <label htmlFor="avatar-upload">
                <div className="px-3 py-2 text-sm font-medium rounded-md cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Upload className="w-4 h-4" />
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <div className="flex space-x-2">
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1"
                />
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                ) : (
                  <Button onClick={handleSaveProfile} variant="default">
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Your email address is managed through your authentication
                provider.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Account Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage multiple accounts and switch between them.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            For demonstration purposes, this feature allows you to simulate
            having multiple accounts. In a real application, you would need to
            authenticate each account.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`relative rounded-lg border p-4 ${account.current ? "border-primary bg-primary/5" : "border-border"}`}
              >
                {account.current && (
                  <div className="absolute top-2 right-2">
                    <Star
                      className="w-4 h-4 text-primary"
                      fill="currentColor"
                    />
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={account.image || ""} alt={account.name} />
                    <AvatarFallback>
                      {getInitials(account.name, account.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.email}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  {!account.current ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleSwitchAccount(account.id)}
                      disabled={isValidatingAccount}
                    >
                      {isValidatingAccount ? (
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 -ml-1 animate-spin text-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        "Switch to this account"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Current account
                    </Button>
                  )}
                </div>
                {!account.current && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute w-8 h-8 p-0 rounded-full -top-2 -right-2 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveAccount(account.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Remove account</span>
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              className="h-[120px] border-dashed flex flex-col items-center justify-center"
              onClick={() => setShowAddAccountDialog(true)}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span>Add Account</span>
            </Button>

            <Dialog
              open={showAddAccountDialog}
              onOpenChange={(open) => {
                if (!open) setShowAddAccountDialog(false);
              }}
            >
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setShowAddAccountDialog(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>

                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                  <DialogDescription>
                    Add another account to switch between different identities.
                    <p className="mt-2 text-xs text-muted-foreground">
                      You can sign in with GitHub or Google to add an account.
                    </p>
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <SignInForm mode="addAccount" showLinks={false} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-destructive">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your account access and security.
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={handleSignOut}
          className="hover:bg-destructive/90 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log out from all devices
        </Button>
      </div>
    </div>
  );
}
