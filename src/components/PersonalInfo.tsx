import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Save, CheckCircle2, Edit3, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface PersonalInfoProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
}

export function PersonalInfo({ navigateTo, onLogout }: PersonalInfoProps) {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <AppLayout navigateTo={navigateTo} currentPage="personal-info" onLogout={onLogout}>
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigateTo('settings')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">Personal Information</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Manage your account profile and details</p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="h-9 sm:h-10 text-xs sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 h-9 sm:h-10 text-xs sm:text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">JD</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{formData.email}</p>
                
                {/* Verification Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Verified Account</span>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-9 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                  disabled={!isEditing}
                >
                  Upload New Photo
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">JPG or PNG. Max 2MB</p>
              </div>
            </Card>
          </div>

          {/* Right Column - Details Forms */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <Card className="p-4 sm:p-6 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Basic Information</h3>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-medium dark:text-slate-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-medium dark:text-slate-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-xs font-medium dark:text-slate-300">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                    className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-4 sm:p-6 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact Information</h3>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium dark:text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Email verified</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium dark:text-slate-300">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </Card>

            {/* Address Information */}
            <Card className="p-4 sm:p-6 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Address Information</h3>
              </div>

              <div className="space-y-4">
                {/* Street Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-medium dark:text-slate-300">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs font-medium dark:text-slate-300">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!isEditing}
                      className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs font-medium dark:text-slate-300">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      disabled={!isEditing}
                      className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-xs font-medium dark:text-slate-300">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      disabled={!isEditing}
                      className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs font-medium dark:text-slate-300">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                    className="h-10 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-4 sm:p-6 border-red-200 dark:bg-slate-800 dark:border-red-900/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Once you delete your account, all your data will be permanently removed. This action cannot be undone.
                  </p>
                  <Button 
                    variant="outline" 
                    className="h-9 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Delete Account Permanently
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}