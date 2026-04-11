import { ReactNode } from 'react';
import { Card } from '../ui/card';

export default ({children}:{children:ReactNode})=><Card className="w-full max-w-md p-5 shadow-xl dark:bg-slate-800 dark:border-slate-700 border-slate-300">

  {children}
</Card>