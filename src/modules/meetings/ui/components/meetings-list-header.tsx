"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { useState } from "react";
import { MeetingsSearchFilters } from "./meetings-search-filter";
import { StatusFilter} from "./status-filter";
import { AgentIdFilter } from "./agent-id-filter";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsListHeader = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const isAnyFilterModified =
    !!filters.status || !!filters.search || !!filters.agentId;

  const onClearFilters = () => {
    setFilters({
      status: null,
      agentId: "",
      search: "",
      page: 1,
    });
  };
  return (
    <>
      <NewMeetingDialog open={isDialogOpen} onOpenChange={setDialogOpen} />
      <div className="py-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-xl">My Meetings</h5>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon />
            New Meeting
          </Button>
        </div>
        <div className="flex items-center gap-x-2 p-1">
          <MeetingsSearchFilters />
          <StatusFilter />
          <AgentIdFilter />
          {isAnyFilterModified && (
            <Button variant="ghost" onClick={onClearFilters}>
              <XCircleIcon />
              Clear
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
