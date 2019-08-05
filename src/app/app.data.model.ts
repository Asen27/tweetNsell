export class Brand {
    user_profile: UserProfile;
    id: string;
    name: string;
    location: string;
    description: string;
    language: string;
    url: string;
    is_verified: boolean;
    number_new_opinions: Number;
    number_new_followers: Number;
    followers_cursor: string;
    social_rating;
    service_industry: ServiceIndustry;
  }

  export class Administrator {
    user_profile: UserProfile;
  }

  export class ServiceIndustry {
    name_en: string;
    name_es: string;
  }


  export class UserProfile {
    id: Number;
    email: string;
    username: string;
    password: string;
    is_staff: boolean;
}
