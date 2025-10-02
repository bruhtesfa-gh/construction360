import { NextRequest, NextResponse } from "next/server";

export function getBuilderId(req: NextRequest) {
    const profile = req.cookies.get('user')?.value;
    const builderId = profile ? JSON.parse(profile || '{}').builder_id : null;
    return builderId;
}

// export class APIListResponse extends NextResponse {

//     json(data: any[]) {
//         return this.json({
//             data,
//             total: data.length
//         })
//     }

// }