<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChangeRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'employid'       => $this->employid,
            'category'       => $this->category,
            'category_label' => $this->category_label,
            'old_value'      => $this->old_value,
            'new_value'      => $this->new_value,
            'status'         => $this->status,
            'remarks'        => $this->remarks,
            'reviewed_at'    => $this->reviewed_at?->toDateTimeString(),
            'created_at'     => $this->created_at->toDateTimeString(),

            // Requester - now using the name accessor
            'requested_by' => $this->requester ? [
                'id'   => $this->requester->employid,  // This is the employid
                'name' => $this->requester->name,      // This will now work! Returns full name
            ] : null,

            // Reviewer (HR) - similarly for reviewer
            'reviewed_by' => $this->reviewer ? [
                'id'   => $this->reviewer->employid,
                'name' => $this->reviewer->name,      // Will also work
            ] : null,

            // Attachment
            'attachment' => $this->attachment ? [
                'id'            => $this->attachment->id,
                'original_name' => $this->attachment->original_name,
                'description'   => $this->attachment->description,
                'size'          => $this->attachment->size_formatted,
                'is_image'      => $this->attachment->is_image,
                'url'           => $this->attachment->url,
            ] : null,
        ];
    }
}
