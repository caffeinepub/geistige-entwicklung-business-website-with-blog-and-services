import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type AnalyticsDataInternal = {
    pageVisits : Map.Map<Text, Nat>;
    elementClicks : Map.Map<Text, Nat>;
    sectionViews : Map.Map<Text, Nat>;
    mp3TrackPlays : Map.Map<Text, Nat>;
  };

  type OldActor = {
    analyticsData : AnalyticsDataInternal;
  };

  type NewAnalyticsDataInternal = {
    pageVisits : Map.Map<Text, Nat>;
    elementClicks : Map.Map<Text, Nat>;
    sectionViews : Map.Map<Text, Nat>;
    mp3TrackPlays : Map.Map<Text, Nat>;
    dailyVisitors : Map.Map<Text, Nat>;
  };

  type NewActor = {
    analyticsData : NewAnalyticsDataInternal;
  };

  public func run(old : OldActor) : NewActor {
    let newAnalyticsData : NewAnalyticsDataInternal = {
      old.analyticsData with
      dailyVisitors = Map.empty<Text, Nat>();
    };
    { old with analyticsData = newAnalyticsData };
  };
};
