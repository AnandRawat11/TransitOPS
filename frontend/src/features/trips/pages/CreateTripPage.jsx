import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CreateTripPage = () => {
  return (
    <div className="p-1 space-y-6 max-w-4xl mx-auto text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Trip</h1>
          <p className="text-slate-400 mt-1">Plan and assign a new logistics trip.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Trip Configuration (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">The complex assignment form with React Hook Form, Zod validation, and dynamic Driver/Vehicle availability will be mounted here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTripPage;
